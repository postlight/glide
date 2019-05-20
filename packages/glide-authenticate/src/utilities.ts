import lambda, { Context } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";

let apiGateway: ApiGatewayManagementApi | null = null;

export { Context };

export type Client = Pick<Request["requestContext"], "connectionId" | "domainName" | "stage">;
export type Request = lambda.APIGatewayProxyEvent;
export type Response = lambda.APIGatewayProxyResult;
export type Responder = (request: Request, context: Context) => Promise<object | null | void>;

export function handler(responder: Responder): lambda.APIGatewayProxyHandler {
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

export namespace params {
  export function get(request: Request, param: string): string | undefined {
    return (request.queryStringParameters || {})[param];
  }

  export function require(request: Request, param: string): string {
    const value = get(request, param);

    if (value == null) {
      throw new Error(`Missing required parameter "${param}"`);
    }

    return value;
  }
}
