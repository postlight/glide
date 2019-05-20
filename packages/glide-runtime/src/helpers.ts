import { format } from "util";

export type Maybe<T> = Option<T> | undefined;
export type Option<T> = T | null;
export type Table<T> = { [key: string]: T };

export interface Class<T> {
  new (...args: any[]): T;
}

export namespace Class {
  const invalidCast = `Expected "%s" to be an instance of %s. Received %s.`;

  export function cast<T>(constructor: Class<T>, variable: string, value: any): T {
    return (
      tryCast(constructor, value) ||
      bail(invalidCast, variable, constructor.name, value ? value.constructor.name : value)
    );
  }

  export function tryCast<T>(constructor: Class<T>, value: any): Option<T> {
    return value instanceof constructor ? value : null;
  }
}

export function assert(condition: boolean, message?: string, ...variables: any): void {
  return condition ? undefined : bail(message || "Assertion Failed", ...variables);
}

export function bail(message: string, ...variables: any[]): never {
  throw new Error(format(message, variables));
}

export function expect<T>(value: Maybe<T>, message?: string, ...variables: any): T {
  assert(value != null, message, ...variables);
  return value as T;
}

export function findMap<T, U>(items: Iterable<T>, fn: (item: T) => Maybe<U>): Maybe<U> {
  for (const input of items) {
    const output = fn(input);
    if (output != null) {
      return output;
    }
  }
}

export function filterMapValues<T, U>(items: Table<T>, fn: (item: T) => Maybe<U>): Table<U> {
  const mapped: Table<U> = {};

  Object.entries(items).forEach(([key, item]) => {
    const result = fn(item);
    if (result != null) {
      mapped[key] = result;
    }
  });

  return mapped;
}

export function warn(message: string, ...variables: any): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(format(message, variables));
  }
}

export function unreachable(): never {
  return bail("Entered unreachable code.");
}
