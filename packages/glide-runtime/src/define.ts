import * as graphql from "graphql";
import { cmp } from "@glide/soql";
import { get, mapKeys, mapValues } from "lodash";
import { Omit } from "utility-types";

import { asObjectType, tryAsInputType } from "./convert";
import { Maybe, expect, filterMapValues } from "./helpers";
import { resolve } from "./resolver";

const { GraphQLDirective, GraphQLNonNull, GraphQLObjectType, GraphQLScalarType } = graphql;

export type Definition<T extends keyof DefinitionTypes = "Schema"> = DefinitionTypes[T];
export type Operator = "assign" | Exclude<keyof typeof cmp, "prototype">;

export interface DefinitionTypes {
  readonly Directive: DirectiveDefinition;
  readonly Field: FieldDefinition;
  readonly Operation: OperationDefinition;
  readonly Parameter: ParameterDefinition;
  readonly Schema: SchemaDefinition;
  readonly Type: TypeDefinition;
}

export interface DirectiveDefinition {
  description?: string;
  locations: graphql.DirectiveLocationEnum[];
  params?: {
    [name: string]: Omit<graphql.GraphQLArgumentConfig, "astNode">;
  };
}

export interface FieldDefinition {
  description?: string;
  primaryKey: boolean;
  required: boolean;
  source: string;
  type: string;
}

export interface OperationDefinition {
  description?: string;
  params: { [name: string]: ParameterDefinition };
  type: string;
}

export interface ParameterDefinition {
  operator: Operator;
  references: string;
}

export interface ScalarDefinition<I, E> {
  description?: string;
  fromLiteral(node: graphql.ValueNode, variables?: any): Maybe<I>;
  fromValue(external: E): I;
  toValue(internal: I): E;
}

export interface SchemaDefinition {
  mutations: { [name: string]: OperationDefinition };
  queries: { [name: string]: OperationDefinition };
  types: { [name: string]: TypeDefinition };
}

export interface TypeDefinition {
  description?: string;
  fields: { [name: string]: FieldDefinition };
  table: string;
}

export interface Scope {
  [name: string]: graphql.GraphQLNamedType;
}

export function directive(name: string, definition: DirectiveDefinition) {
  const config: any = mapKeys(definition, (_, key) => {
    return key === "params" ? "args" : key;
  });

  return new GraphQLDirective({
    ...config,
    name,
  });
}

export function operation(scope: Scope, schema: SchemaDefinition, definition: OperationDefinition) {
  const object = asObjectType(scope[definition.type]);
  const type = schema.types[definition.type];

  return {
    args: filterMapValues(definition.params, definition => {
      const result = parameter(scope, type, definition);
      return tryAsInputType(result.type) && result;
    }),
    description: definition.description,
    resolve: resolve(schema, definition.params, type),
    type: object,
  };
}

export function parameter(scope: Scope, type: TypeDefinition, definition: ParameterDefinition) {
  const field = expect(type.fields[definition.references]);

  return {
    description: field.description,
    type: scope[field.type],
  };
}

export function scalar<I, E = string>(name: string, definition: ScalarDefinition<I, E>) {
  const config: any = mapKeys(definition, (_, key) => {
    switch (key) {
      case "fromLiteral": {
        return "parseLiteral";
      }
      case "fromValue": {
        return "parseValue";
      }
      case "toValue": {
        return "serialize";
      }
      default:
        return key;
    }
  });

  return new GraphQLScalarType({
    ...config,
    name,
  });
}

export function type(name: string, scope: Scope, definition: TypeDefinition) {
  return new GraphQLObjectType({
    description: definition.description,
    fields: () => {
      return mapValues(definition.fields, field => {
        const { description, required, source } = field;
        const resolve = (record: object) => get(record, source);
        let type = scope[field.type] as graphql.GraphQLOutputType;

        if (required) {
          type = new GraphQLNonNull(type);
        }

        return {
          description,
          resolve,
          type,
        };
      });
    },
    name,
  });
}
