import * as graphql from "graphql";

import { Maybe, expect } from "./helpers";

const enum ErrorKind {
  ExpectedObject = "Expected a GraphQL object type (received: %s)",
  ExpectedInput = "Expected a GraphQL input type (received: %s)",
}

export function asObjectType(value: Maybe<graphql.GraphQLType>) {
  return expect(tryAsObjectType(value), ErrorKind.ExpectedObject, value);
}

export function asInputType(value: Maybe<graphql.GraphQLType>) {
  return expect(tryAsInputType(value), ErrorKind.ExpectedInput, value);
}

export function tryAsObjectType(value: Maybe<graphql.GraphQLType>) {
  return graphql.isObjectType(value) ? value : null;
}

export function tryAsInputType(value: Maybe<graphql.GraphQLType>) {
  return graphql.isInputType(value) ? value : null;
}
