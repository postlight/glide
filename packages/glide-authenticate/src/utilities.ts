import lambda, { Context } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { OAuth2, OAuth2Options } from "jsforce";
import nconf from "nconf";

import { Environment } from "./types";

let apiGateway: ApiGatewayManagementApi | null = null;

export { Context };

export type Client = Pick<Request["requestContext"], "connectionId" | "domainName" | "stage">;
export type Request = lambda.APIGatewayProxyEvent;
export type Response = lambda.APIGatewayProxyResult;
export type Responder = (request: Request, context: Context) => Promise<object | null | void>;

export function handler(responder: Responder): lambda.APIGatewayProxyHandler {
  nconf.env("__");

  return (request, context, callback) => {
    responder(request, context).then(
      data => {
        callback(null, {
          body: JSON.stringify({
            data: data ? data : { message: "OK" },
          }),
          headers: { "Content-Type": "application/json" },
          statusCode: 200,
        });
      },
      error => {
        console.error(error);
        callback(null, {
          body: JSON.stringify({
            errors: [{ message: error.message }],
          }),
          headers: { "Content-Type": "application/json" },
          statusCode: 500,
        });
      },
    );
  };
}

export async function send(client: Client, data: object): Promise<void> {
  const message = {
    ConnectionId: client.connectionId!,
    Data: JSON.stringify(data),
  };

  if (apiGateway == null) {
    apiGateway = new ApiGatewayManagementApi({
      apiVersion: "2029",
      endpoint: `https://${client.domainName}/${client.stage}`,
    });
  }

  await apiGateway.postToConnection(message).promise();
}

export namespace oauth2 {
  const url = {
    [Environment.Default]: "https://login.salesforce.com",
    [Environment.Sandbox]: "https://test.salesforce.com",
  };

  export function configure(environment?: string): OAuth2 {
    return new OAuth2(options(environment));
  }

  export function options(environment?: string): OAuth2Options {
    return {
      ...nconf.get("oauth"),
      loginUrl: url[Environment.from(environment)],
    };
  }
}

export namespace params {
  export function get(request: Request, param: string): string | undefined;
  export function get(request: Request, param: string, value: string): string;
  export function get(request: Request, param: string, value?: string): string | undefined {
    return (request.queryStringParameters || {})[param] || value;
  }

  export function require(request: Request, param: string): string {
    const value = get(request, param);

    if (value == null) {
      throw new Error(`Missing required parameter "${param}"`);
    }

    return value;
  }
}
