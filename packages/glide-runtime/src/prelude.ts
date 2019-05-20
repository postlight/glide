import {
  DirectiveLocation,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  valueFromASTUntyped,
} from "graphql";

import { assert, expect } from "./helpers";
import * as define from "./define";

export {
  GraphQLBoolean as Boolean,
  GraphQLFloat as Float,
  GraphQLInt as Int,
  GraphQLID as ID,
  GraphQLString as String,
};

export const Address = define.scalar<object, object>("Address", {
  description: "",
  fromLiteral: (node, variables) => {
    return expect(valueFromASTUntyped(node, variables));
  },
  fromValue: value => {
    return expect(value);
  },
  toValue: address => {
    return expect(address);
  },
});

export const DateTime = define.scalar<Date>("DateTime", {
  description: "",
  fromLiteral: (node, variables) => {
    const value = valueFromASTUntyped(node, variables);
    return typeof value === "string" ? new Date(value) : undefined;
  },
  fromValue: value => {
    assert(typeof value === "string");
    return new Date(value);
  },
  toValue: date => {
    return new Date(date).toISOString();
  },
});

export const Picklist = define.scalar<any[], any[]>("Picklist", {
  description: "",
  fromLiteral: (node, variables) => {
    return expect(valueFromASTUntyped(node, variables));
  },
  fromValue: value => {
    assert(Array.isArray(value));
    return expect(value);
  },
  toValue: picklist => {
    assert(Array.isArray(picklist));
    return expect(picklist);
  },
});

export const page = define.directive("page", {
  description: "",
  locations: [DirectiveLocation.QUERY],
  params: {
    limit: {
      description: "",
      type: new GraphQLNonNull(GraphQLInt),
    },
    offset: {
      defaultValue: 0,
      description: "",
      type: GraphQLInt,
    },
  },
});
