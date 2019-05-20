import { Connection, OAuth2 } from "jsforce";
import nconf from "nconf";

import { handler, params, send } from "./utilities";

const oauth2 = new OAuth2(nconf.env("__").get("oauth"));

const enum MessageType {
  Authenticated = "AUTHENTICATED",
  Initialize = "INITIALIZE",
}

export const callback = handler(async request => {
  const client = JSON.parse(params.require(request, "state"));
  const connection = new Connection({ oauth2 });

  await connection.authorize(params.require(request, "code"));

  await send(client, {
    data: {
      accessToken: connection.accessToken,
      oauth2: nconf.get("oauth"),
      // @ts-ignore
      refreshToken: connection.refreshToken,
    },
    type: MessageType.Authenticated,
  });

  return {
    message: "You have been successfully logged in",
  };
});

export const connect = handler(async () => {
  // noop
});

export const message = handler(async request => {
  const state = JSON.stringify({
    connectionId: request.requestContext.connectionId,
    domainName: request.requestContext.domainName,
    stage: request.requestContext.stage,
  });

  await send(request.requestContext, {
    data: oauth2.getAuthorizationUrl({ state }),
    type: MessageType.Initialize,
  });
});

export const refresh = handler(async request => {
  const { token } = JSON.parse(request.body || "{}");
  const results = await oauth2.refreshToken(token);

  return {
    oauth2: nconf.get("oauth"),
    accessToken: results.access_token,
    refreshToken: results.refresh_token,
  };
});
