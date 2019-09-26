import { Connection } from "jsforce";

import { MessageType } from "../../types";
import { handler, params, oauth2, send } from "../../utilities";

export default handler(async request => {
  const environment = params.get(request, "environment");
  const connection = new Connection({
    oauth2: oauth2.configure(environment),
  });

  await connection.authorize(params.require(request, "code"));
  await send(JSON.parse(params.require(request, "state")), {
    data: {
      accessToken: connection.accessToken,
      oauth2: oauth2.options(environment),
      // @ts-ignore
      refreshToken: connection.refreshToken,
    },
    type: MessageType.Authenticated,
  });

  return {
    message: "You have been successfully logged in",
  };
});
