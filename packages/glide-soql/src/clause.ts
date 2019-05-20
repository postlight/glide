import { Bool, Cmp, Field } from "./expr";
import { IS_EMPTY, Fragment, isEmpty, notEmpty } from "./util";

export type Direction = "ASC" | "DESC";

export class GroupBy implements Fragment {
  constructor(private readonly fields: Field[] = [], private readonly having?: Bool | Cmp) {}

  [IS_EMPTY](): boolean {
    return this.fields.length === 0;
  }

  toString(): string {
    let clause = `GROUP BY ${this.fields.join(", ")}`;

    if (this.having && notEmpty(this.having)) {
      clause += ` HAVING ${this.having}`;
    }

    return clause;
  }
}

export class Limit implements Fragment {
  private readonly size?: number | void;

  constructor(size?: bigint | number) {
    this.size = tryIntoSafeInteger(size);
  }

  [IS_EMPTY](): boolean {
    return this.size == null;
  }

  toString(): string {
    return `LIMIT ${this.size}`;
  }
}

export class Offset implements Fragment {
  private readonly size?: number | void;

  constructor(size?: bigint | number) {
    this.size = tryIntoSafeInteger(size);
  }

  [IS_EMPTY](): boolean {
    return this.size == null;
  }

  toString(): string {
    return `OFFSET ${this.size}`;
  }
}

export class OrderBy implements Fragment {
  private readonly direction: Direction = "ASC";

  constructor(private readonly fields: Field[] = [], direction?: Direction) {
    this.direction = intoDirection(direction);
  }

  [IS_EMPTY](): boolean {
    return this.fields.length === 0;
  }

  toString(): string {
    return `ORDER BY ${this.fields.join(", ")} ${this.direction}`;
  }
}

export class Where implements Fragment {
  constructor(private readonly condition?: Bool | Cmp) {}

  [IS_EMPTY](): boolean {
    return this.condition == null || isEmpty(this.condition);
  }

  toString(): string {
    return `WHERE ${this.condition}`;
  }
}

function intoDirection(value: unknown): Direction {
  return value === "DESC" ? "DESC" : "ASC";
}

function tryIntoSafeInteger(value: unknown): number | void {
  const num = Number(value);
  return Number.isSafeInteger(num) && num >= 0 ? num : undefined;
}
