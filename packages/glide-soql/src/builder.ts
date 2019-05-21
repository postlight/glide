import { Direction, GroupBy, Limit, Offset, OrderBy, Where } from "./clause";
import { Bool, Cmp, Field } from "./expr";
import { IS_EMPTY, Fragment, notEmpty } from "./util";

export interface Parts {
  groupBy: GroupBy;
  limit: Limit;
  offset: Offset;
  orderBy: OrderBy;
  select: Select;
  where: Where;
}

export class Builder {
  private readonly parts: Parts;

  constructor(select: Select) {
    this.parts = {
      select,
      groupBy: new GroupBy(),
      limit: new Limit(),
      offset: new Offset(),
      orderBy: new OrderBy(),
      where: new Where(),
    };
  }

  static isBuilder(value: unknown): value is Builder {
    return value instanceof Builder;
  }

  groupBy(field: Field | Field[], having?: Bool | Cmp): Builder {
    const fields = Array.isArray(field) ? field : [field];

    this.parts.groupBy = new GroupBy(fields, having);
    return this;
  }

  limit(size: bigint | number): Builder {
    this.parts.limit = new Limit(size);
    return this;
  }

  offset(size: bigint | number): Builder {
    this.parts.offset = new Offset(size);
    return this;
  }

  orderBy(field: Field | Field[], direction?: Direction): Builder {
    const fields = Array.isArray(field) ? field : [field];

    this.parts.orderBy = new OrderBy(fields, direction);
    return this;
  }

  select(...fields: (Field | Select)[]): Builder {
    this.parts.select.select(...fields);
    return this;
  }

  toString(): string {
    const parts = this.parts;
    let query = `${parts.select}`;

    if (query === "") {
      return query;
    }

    if (notEmpty(parts.where)) {
      query += ` ${parts.where}`;
    }

    if (notEmpty(parts.groupBy)) {
      query += ` ${parts.groupBy}`;
    }

    if (notEmpty(parts.orderBy)) {
      query += ` ${parts.orderBy}`;
    }

    if (notEmpty(parts.limit)) {
      query += ` ${parts.limit}`;
    }

    if (notEmpty(parts.offset)) {
      query += ` ${parts.offset}`;
    }

    return query;
  }

  where(condition: Bool | Cmp): Builder {
    this.parts.where = new Where(condition);
    return this;
  }
}

export class Select implements Fragment {
  private readonly fields = new Set<Field | Select>();

  private constructor(private readonly object?: string) {}

  static from(object: string): Select {
    return new Select(object);
  }

  static isSelect(value: unknown): value is Select {
    return value instanceof Select;
  }

  [IS_EMPTY](): boolean {
    return this.fields.size === 0;
  }

  concat({ fields }: Select): Select {
    return this.select(
      ...Array.from(fields, field => {
        if (field instanceof Select) {
          const { fields, object } = field;
          const subselect = new Select(`${this.object}.${object}`);

          return subselect.select(...fields);
        }

        return `${this.object}.${field}`;
      }),
    );
  }

  select(...fields: (Field | Select)[]): Select {
    fields.forEach(field => this.fields.add(field));
    return this;
  }

  toString(): string {
    const fields = Array.from(this.fields)
      .filter(field => (typeof field === "string" ? Boolean(field) : notEmpty(field)))
      .map(field => (field instanceof Select ? `(${field})` : `${field}`));

    return fields.length > 0 ? `SELECT ${fields.join(", ")} FROM ${this.object}` : "";
  }
}
