import { Connection, OAuth2, OAuth2Options } from "jsforce";
import WebSocket from "ws";
import open from "open";

import * as paths from "./paths";
import { exists, json, mkdir } from "./utilities";

type Credentials = { [key: string]: string };
type Session = Readonly<Tokens & { oauth2: OAuth2Options }>;

type Message =
  | Readonly<{ data: Session; type: MessageType.Authenticated }>
  | Readonly<{ data: string; type: MessageType.Initialize }>;

interface RefreshParams {
  readonly environment?: Environment;
  readonly token: string;
}

interface Refresh {
  readonly data?: Session;
  readonly errors?: [Pick<Error, "message">];
}

interface Tokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

const enum Endpoint {
  Refresh = "https://e0aspv1j4f.execute-api.us-east-1.amazonaws.com/dev/oauth/refresh",
  Socket = "wss://xpi8d4oteh.execute-api.us-east-1.amazonaws.com/dev",
}

const enum MessageType {
  Authenticated = "AUTHENTICATED",
  Initialize = "INITIALIZE",
}

export const enum Environment {
  Default = "default",
  Sandbox = "sandbox",
}

export async function login(instance: string, environment: Environment): Promise<Connection> {
  const credentials = await loadCredentials();

  if (credentials[instance]) {
    return refreshToken(instance, {
      environment,
      token: credentials[instance],
    });
  }

  return new Promise((resolve, reject) => {
    const socket = new WebSocket(Endpoint.Socket);

    socket.on("open", () => {
      socket.send(
        JSON.stringify({
          data: { environment },
          type: MessageType.Initialize,
        }),
      );
    });

    socket.on("error", error => {
      socket.removeAllListeners();
      reject(error);
    });

    socket.on("message", async data => {
      const message: Message = JSON.parse(`${data}`);

      switch (message.type) {
        case MessageType.Authenticated: {
          socket.removeAllListeners().close();

          resolve(createConnection(instance, message.data));

          credentials[instance] = message.data.refreshToken;
          await json.write(paths.creds, credentials);

          break;
        }
        case MessageType.Initialize: {
          open(message.data).catch(reject);
          break;
        }
      }
    });
  });
}

function createConnection(instance: string, session: Session): Connection {
  const { oauth2, ...tokens } = session;

  return new Connection({
    ...tokens,
    instanceUrl: instance,
    oauth2: new OAuth2(oauth2),
  });
}

async function loadCredentials(): Promise<Credentials> {
  let credentials: Credentials = {};

  if (await exists(paths.creds)) {
    credentials = await json.read(paths.creds);
  } else {
    await mkdir(paths.home);
    await json.write(paths.creds, credentials);
  }

  return credentials;
}

async function refreshToken(instance: string, params: RefreshParams): Promise<Connection> {
  const [{ data, errors }, response] = await json.post<Refresh>(Endpoint.Refresh, params);

  return response.ok
    ? createConnection(instance, data!)
    : Promise.reject(new Error(errors![0].message));
}
