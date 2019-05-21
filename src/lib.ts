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

/**
 * Controls how data is fetched against your Salesforce instance.
 */
export interface Options {
  /**
   * A global connection object to use for every GraphQL request.
   *
   * Providing this option is useful in development environments where you do
   * not want to send an `Authorization` header with every request.
   */
  connection?: Connection | null;

  /**
   * The Salesforce instance url from which the schema was defined.
   *
   * This comes from the first argument passed to the `glide init` command.
   */
  instance: string;

  /**
   * A schema defintion that describes the shape of your Salesforce instance.
   */
  schema: Definition;
}

/**
 * Returns an express application that can be used as a standalone GraphQL server
 * or mounted onto an existing express router.
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
