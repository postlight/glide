import { Definition, Operator } from "@glide/runtime";
import jsforce from "jsforce";

import { Options } from "../lib";
import { login } from "../oauth";
import { json, string } from "../utilities";

interface Identifiers {
  article: string;
  field: Inflection;
  type: Inflection;
}

interface Inflection {
  plural: string;
  singular: string;
}

export default async function init(origin: string, path: string = "glide.json"): Promise<void> {
  const { instance, schema } = createOptions(origin);
  const connection = await login(instance);
  const sobjects = await connection.describeGlobal().then(({ sobjects }) => {
    return Promise.all(sobjects.map(({ name }) => connection.describe(name)));
  });

  sobjects.forEach(sobject => {
    const [type, idents] = defineType(sobject.name);
    const mutation = defineMutation(idents);
    const query = defineQuery(idents);

    schema.types[idents.type.singular] = type;

    if (sobject.createable && sobject.updateable) {
      schema.mutations[idents.field.singular] = mutation;
    }

    if (sobject.queryable) {
      schema.queries[idents.field.plural] = query;
    }

    sobject.fields.forEach(field => {
      if (field.relationshipName && notEmpty(field.referenceTo)) {
        type.fields[string.fieldify(field.relationshipName!)] = defineField(field);
      } else if (!field.relationshipName) {
        const identifier = string.fieldify(field.name);

        mutation.params[identifier] = defineParameter(identifier, "assign");
        query.params[identifier] = defineParameter(identifier, "eq");
        type.fields[identifier] = defineField(field);
      }
    });
  });

  await json.write(path, {
    instance,
    schema,
  });
}

function createOptions(instance: string): Options {
  return {
    instance,
    schema: {
      mutations: {},
      queries: {},
      types: {},
    },
  };
}

function defineField(field: jsforce.Field): Definition<"Field"> {
  let type: string;

  switch (field.type) {
    case "address": {
      type = "Address";
      break;
    }
    case "boolean": {
      type = "Boolean";
      break;
    }
    case "currency":
    case "double":
    case "percent": {
      type = "Float";
      break;
    }
    case "datetime": {
      type = "DateTime";
      break;
    }
    case "id": {
      type = "ID";
      break;
    }
    case "int": {
      type = "Int";
      break;
    }
    case "multipicklist": {
      type = "Picklist";
      break;
    }
    case "reference": {
      type = notEmpty(field.referenceTo) ? string.typeify(field.referenceTo[0]) : "ID";
      break;
    }
    default: {
      type = "String";
      break;
    }
  }

  return {
    description: field.inlineHelpText || field.label,
    primaryKey: field.idLookup,
    required: !field.nillable,
    source: field.relationshipName || field.name,
    type,
  };
}

function defineMutation({ article, type }: Identifiers): Definition<"Operation"> {
  return {
    description: `Create or update ${article} ${type.singular}.`,
    params: {},
    type: type.singular,
  };
}

function defineParameter(references: string, operator: Operator): Definition<"Parameter"> {
  return {
    operator,
    references,
  };
}

function defineQuery({ type }: Identifiers): Definition<"Operation"> {
  return {
    description: `Retreive a list of ${type.plural}.`,
    params: {},
    type: type.singular,
  };
}

function defineType(table: string): [Definition<"Type">, Identifiers] {
  const article = /^[aeiou]/.test(table) ? "an" : "a";
  const field = string.fieldify(table);
  const type = string.typeify(table);

  return [
    {
      description: `Represents ${article} ${table} from Salesforce.`,
      fields: {},
      table: table,
    },
    {
      article,
      field: {
        plural: string.plural(field),
        singular: field,
      },
      type: {
        plural: string.plural(type),
        singular: type,
      },
    },
  ];
}

function notEmpty<T>(input: T[] | null | undefined): input is T[] {
  return Array.isArray(input) && input.length > 0;
}
