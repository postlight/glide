import { get } from "lodash";

import { MessageType } from "../types";
import { handler, oauth2, send } from "../utilities";

export default handler(async request => {
  const { connectionId, domainName, stage } = request.requestContext;
  const environment = get(JSON.parse(request.body || "{}"), "data.environment");
  const result = oauth2.configure(environment).getAuthorizationUrl({
    state: JSON.stringify({ connectionId, domainName, stage }),
  });

  await send(request.requestContext, {
    data: result,
    type: MessageType.Initialize,
  });
});
