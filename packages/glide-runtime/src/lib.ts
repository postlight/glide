import * as graphql from "graphql";
import { Connection } from "jsforce";
import { mapValues, memoize, pickBy } from "lodash";

import { Definition, Operator, Scope, operation, type } from "./define";
import * as prelude from "./prelude";

export { Definition, Operator };

export interface Runtime {
  /**
   * Asynchronously executes the given GraphQL source string against your Salesforce instance.
   * Returns a `Promise` that resolves with the execution result of GraphQL `source` string.
   *
   * @param connection - A jsforce connection instance to interact with Salesforce.
   * @param source - The GraphQL source string to execute.
   */
  (connection: Connection, source: string): Promise<graphql.ExecutionResult>;

  /**
   * Executes a synchronous introspection query against the schema.
   */
  introspectionFromSchema(): graphql.IntrospectionQuery;

  /**
   * Returns a pretty-printed GraphQL schema source string.
   */
  printSchema(): string;
}

/**
 * Creates an instance of the glide runtime.
 */
export default function createRuntime(definition: Definition<"Schema">): Runtime {
  const schema = defineSchema(definition);
  const runtime = Runtime as Runtime;

  function Runtime(connection: Connection, source: string) {
    return graphql.graphql(schema, source, null, connection);
  }

  Object.defineProperties(runtime, {
    introspectionFromSchema: {
      value: memoize(() => graphql.introspectionFromSchema(schema)),
    },
    printSchema: {
      value: memoize(() => graphql.printSchema(schema)),
    },
  });

  return runtime;
}

function defineSchema(schema: Definition<"Schema">) {
  const { mutations, queries, types } = schema;
  const scope: Scope = {};

  Object.assign(
    scope,
    pickBy(prelude, graphql.isNamedType),
    mapValues(types, (definition, name) => type(name, scope, definition)),
  );

  return new graphql.GraphQLSchema({
    directives: [prelude.page],
    mutation: new graphql.GraphQLObjectType({
      description: "The root mutation type.",
      fields: () =>
        mapValues(mutations, definition => {
          const { type, ...field } = operation(scope, schema, definition);

          return Object.assign(field, {
            type: new graphql.GraphQLNonNull(type),
          });
        }),
      name: "Mutation",
    }),
    query: new graphql.GraphQLObjectType({
      description: "The root query type.",
      fields: () =>
        mapValues(queries, definition => {
          const { type, ...field } = operation(scope, schema, definition);

          return Object.assign(field, {
            type: new graphql.GraphQLNonNull(new graphql.GraphQLList(type)),
          });
        }),
      name: "Query",
    }),
    types: Object.values(scope),
  });
}
