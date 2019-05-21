import * as ops from "./ops";
import { IS_EMPTY, Fragment } from "./util";

const SINGLE_QUOTE = /'/gm;

export type Expr = Bool | Cmp;
export type Field = string | Fn;
export type Scalar = bigint | boolean | null | number | string;

export class Bool implements Fragment {
  private readonly value: Expr[];

  private constructor(private readonly operator: ops.Bool, value: Expr[]) {
    this.value = value.reduce<Expr[]>((acc, item) => {
      if (item instanceof Cmp || operator !== item.operator) {
        acc.push(item);
        return acc;
      }

      return acc.concat(item.value);
    }, []);
  }

  static and(...value: Expr[]): Bool {
    return new Bool(ops.Bool.And, value);
  }

  static or(...value: Expr[]): Bool {
    return new Bool(ops.Bool.Or, value);
  }

  [IS_EMPTY](): boolean {
    return this.value.length === 0;
  }

  toString(): string {
    return this.value
      .map(expr => (expr instanceof Bool ? `(${expr})` : `${expr}`))
      .join(` ${this.operator} `);
  }
}

export class Cmp implements Fragment {
  private constructor(
    private readonly field: Field,
    private readonly operator: ops.Cmp,
    private readonly expression: Scalar | Scalar[],
  ) {}

  static eq(field: Field, expression: Scalar): Cmp {
    return new Cmp(field, ops.Cmp.Eq, expression);
  }

  static gt(field: Field, expression: Scalar): Cmp {
    return new Cmp(field, ops.Cmp.Gt, expression);
  }

  static gte(field: Field, expression: Scalar): Cmp {
    return new Cmp(field, ops.Cmp.Gte, expression);
  }

  static in(field: Field, expression: Scalar[]): Cmp {
    return new Cmp(field, ops.Cmp.In, expression);
  }

  static like(field: Field, expression: string): Cmp {
    return new Cmp(field, ops.Cmp.Like, expression);
  }

  static lt(field: Field, expression: Scalar): Cmp {
    return new Cmp(field, ops.Cmp.Lt, expression);
  }

  static lte(field: Field, expression: Scalar): Cmp {
    return new Cmp(field, ops.Cmp.Lte, expression);
  }

  static ne(field: Field, expression: Scalar): Cmp {
    return new Cmp(field, ops.Cmp.Ne, expression);
  }

  static notIn(field: Field, expression: Scalar[]): Cmp {
    return new Cmp(field, ops.Cmp.NotIn, expression);
  }

  [IS_EMPTY](): boolean {
    return false;
  }

  toString(): string {
    let expression: string;

    if (Array.isArray(this.expression)) {
      expression = `(${this.expression.map(stringifyScalar).join(", ")})`;
    } else {
      expression = stringifyScalar(this.expression);
    }

    return `${this.field} ${this.operator} ${expression}`;
  }
}

export class Fn implements Fragment {
  private constructor(private readonly ident: string, private readonly field?: string) {}

  static avg(field: string): Fn {
    return new Fn("AVG", field);
  }

  static calendarMonth(field: string): Fn {
    return new Fn("CALENDAR_MONTH", field);
  }

  static calendarQuarter(field: string): Fn {
    return new Fn("CALENDAR_QUARTER", field);
  }

  static calendarYear(field: string): Fn {
    return new Fn("CALENDAR_YEAR", field);
  }

  static convertTimezone(field: string): Fn {
    return new Fn("CONVERT_TIMEZONE", field);
  }

  static count(field?: string): Fn {
    return new Fn("COUNT", field);
  }

  static countDistinct(field?: string): Fn {
    return new Fn("COUNT_DISTINCT", field);
  }

  static dayInMonth(field: string): Fn {
    return new Fn("DAY_IN_MONTH", field);
  }

  static dayInWeek(field: string): Fn {
    return new Fn("DAY_IN_WEEK", field);
  }

  static dayInYear(field: string): Fn {
    return new Fn("DAY_IN_YEAR", field);
  }

  static dayOnly(field: string): Fn {
    return new Fn("DAY_ONLY", field);
  }

  static fiscalMonth(field: string): Fn {
    return new Fn("FISCAL_MONTH", field);
  }

  static fiscalQuarter(field: string): Fn {
    return new Fn("FISCAL_QUARTER", field);
  }

  static fiscalYear(field: string): Fn {
    return new Fn("FISCAL_YEAR", field);
  }

  static hourInDay(field: string): Fn {
    return new Fn("HOUR_IN_DAY", field);
  }

  static max(field: string): Fn {
    return new Fn("MAX", field);
  }

  static min(field: string): Fn {
    return new Fn("MIN", field);
  }

  static sum(field: string): Fn {
    return new Fn("SUM", field);
  }

  static weekInMonth(field: string): Fn {
    return new Fn("WEEK_IN_MONTH", field);
  }

  static weekInYear(field: string): Fn {
    return new Fn("WEEK_IN_YEAR", field);
  }

  [IS_EMPTY](): boolean {
    return false;
  }

  toString(): string {
    return `${this.ident}(${this.field ? this.field : ""})`;
  }
}

function stringifyScalar(input: Scalar): string {
  switch (typeof input) {
    case "boolean":
      return `${input}`.toUpperCase();
    case "string":
      return `'${input.replace(SINGLE_QUOTE, "\\'")}'`;
    default:
      return input == null ? "null" : String(input);
  }
}
