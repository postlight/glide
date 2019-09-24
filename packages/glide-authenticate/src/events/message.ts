import { MessageType } from "../types";
import { handler, params, oauth2, send } from "../utilities";

export default handler(async request => {
  const { connectionId, domainName, stage } = request.requestContext;
  const strategy = oauth2.configure(params.get(request, "environment"));
  const result = strategy.getAuthorizationUrl({
    state: JSON.stringify({ connectionId, domainName, stage }),
  });

  await send(request.requestContext, {
    data: result,
    type: MessageType.Initialize,
  });
});
