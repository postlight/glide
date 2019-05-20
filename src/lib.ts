import createRuntime, { Definition } from "@glide/runtime";
import { json } from "body-parser";
import { GraphQLError } from "graphql";
import playground from "graphql-playground-middleware-express";
import express, { Application, Request, Response } from "express";
import { Connection } from "jsforce";
import morgan from "morgan";

import { isDevEnv } from "./utilities";

const playgroundSettings: any = {
  endpoint: "/",
  settings: {
    "schema.polling.enable": false,
  },
};

export interface Options {
  connection?: Connection | null;
  instance: string;
  schema: Definition;
}

/**
 * Returns a middleware function that executes to GraphQL queries and mutations
 * against the provided Salesforce instance and configuration.
 */
export default function glide(options: Options): Application {
  const application = express();
  const runtime = createRuntime(options.schema);

  application.use(morgan(isDevEnv() ? "dev" : "common"));

  application.get("/", playground(playgroundSettings));
  application.post("/", json(), (request, response, next) => {
    const authorization = request.get("authorization");
    let { connection } = options;

    if (typeof authorization === "string") {
      connection = new Connection({
        accessToken: authorization.substr(7),
        instanceUrl: options.instance,
      });
    }

    if (connection == null) {
      return next(new GraphQLError("Session expired or invalid"));
    }

    runtime(connection, request.body.query).then(
      result => response.json(result),
      error => next(error),
    );
  });

  return application.use(errorHandler);
}

function errorHandler(error: Error, request: Request, response: Response): void {
  const errors: GraphQLError[] = [];

  if (error instanceof GraphQLError) {
    errors.push(error);
  } else {
    errors.push(new GraphQLError(error.message || "Internal Server Error"));
  }

  response.json({
    errors,
  });
}
