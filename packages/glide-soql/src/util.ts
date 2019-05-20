export const IS_EMPTY = Symbol("glide.isEmpty");

export interface Fragment {
  [IS_EMPTY](): boolean;
  toString(): string;
}

export function notEmpty(input: Fragment): boolean {
  return !isEmpty(input);
}

export function isEmpty(input: Fragment): boolean {
  return input[IS_EMPTY]();
}
