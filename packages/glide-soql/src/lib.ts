import { Builder, Select } from "./builder";
import { Bool, Cmp, Fn } from "./expr";

export { Parts } from "./builder";
export { Field, Scalar } from "./expr";

export type Bool = Bool;
export type Builder = Builder;
export type Cmp = Cmp;
export type Fn = Fn;
export type Select = Select;

export const { and, or } = Bool;
export const { isBuilder } = Builder;
export const { from, isSelect } = Select;
export const cmp = Cmp;
export const fn = Fn;

export default function soql(select: string | Select): Builder {
  return new Builder(isSelect(select) ? select : from(select));
}
