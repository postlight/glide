import { handler, oauth2 } from "../../utilities";

export default handler(async request => {
  const { environment, token } = JSON.parse(request.body || "{}");
  const result = await oauth2.configure(environment).refreshToken(token);

  return {
    oauth2: oauth2.options(environment),
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
  };
});
