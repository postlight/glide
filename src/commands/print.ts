import createRuntime from "@glide/runtime";

import { Options } from "../lib";
import { json } from "../utilities";

export default async function print(path: string = "glide.json"): Promise<void> {
  const { schema } = await json.read<Options>(path);
  console.log(createRuntime(schema).printSchema());
}
