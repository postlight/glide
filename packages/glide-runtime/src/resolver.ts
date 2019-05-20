import soql, { and, cmp } from "@glide/soql";
import * as graphql from "graphql";
import { Connection } from "jsforce";
import { find, get, set } from "lodash";

import { Maybe, Table, bail, expect } from "./helpers";
import { Definition } from "./define";

export type ASTNode = Maybe<graphql.ASTNode[] | graphql.ASTNode>;
export type Arguments = Table<unknown>;
export type Parameters = Table<Definition<"Parameter">>;

export interface Resolver {
  (obj: null, args: Arguments, context: Connection, info: graphql.GraphQLResolveInfo): Promise<
    object
  >;
}

export function resolve(
  _schema: Definition<"Schema">,
  params: Parameters,
  type: Definition<"Type">,
): Resolver {
  const primaryKey = expect(find(type.fields, "primaryKey"));

  return async (_obj, _args, context, info) => {
    const { directives, operation } = info.operation;
    const ancestors = [] as string[];
    const changes = {};
    const query = soql(type.table);
    let where = and();

    function pathFromNode(node: graphql.NameNode, root = true) {
      const { source } = type.fields[node.value];
      return [...ancestors.slice(root ? 0 : 1), source].join(".");
    }

    function valueFromNode(node: graphql.ValueNode) {
      return graphql.valueFromASTUntyped(node, info.variableValues);
    }

    visit(Array.from(directives || []), {
      Argument: ({ name, value }) => {
        switch (name.value) {
          case "limit": {
            query.limit(valueFromNode(value));
            break;
          }
          case "offset": {
            query.offset(valueFromNode(value));
            break;
          }
        }
      },
    });

    visit(nodeFor(info), {
      Argument: argument => {
        const { operator } = expect(params[argument.name.value]);
        const value = valueFromNode(argument.value);

        if (operator === "assign") {
          set(changes, pathFromNode(argument.name, false), value);
        } else {
          where = and(where, cmp[operator](pathFromNode(argument.name), value));
        }
      },
      Field: {
        enter: ({ name, selectionSet }) => {
          if (ancestors.length === 0) {
            ancestors.push(type.table);
          } else if (selectionSet) {
            ancestors.push(type.fields[name.value].source);
          } else {
            const { source } = type.fields[name.value];
            query.select([...ancestors, source].join("."));
          }
        },
        leave: ({ selectionSet }) => {
          if (selectionSet) {
            ancestors.pop();
          }
        },
      },
    });

    query.where(where);

    switch (operation) {
      case "mutation": {
        const result = await context.upsert(type.table, changes, primaryKey.source);
        return get(await context.query(`${query}`), "records.0");
      }
      case "query": {
        return get(await context.query(`${query}`), "records");
      }
      default: {
        return bail(`Operations of type "%s" are not supported.`, operation);
      }
    }
  };
}

function nodeFor(info: graphql.GraphQLResolveInfo): Maybe<graphql.FieldNode> {
  return info.fieldNodes.find(node => info.fieldName === node.name.value);
}

function visit(node: ASTNode, visitor: graphql.ASTVisitor): void {
  if (Array.isArray(node)) {
    node.forEach(child => graphql.visit(child, visitor));
  } else if (node && "kind" in node) {
    graphql.visit(node, visitor);
  }
}
