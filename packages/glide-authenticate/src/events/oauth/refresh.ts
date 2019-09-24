import { handler, oauth2 } from "../../utilities";

export const refresh = handler(async request => {
  const { environment, token } = JSON.parse(request.body || "{}");
  const strategy = oauth2.configure(environment);
  const result = await strategy.refreshToken(token);

  return {
    oauth2: oauth2.options(environment),
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
  };
});
