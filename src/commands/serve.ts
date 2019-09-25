import { EOL } from "os";

import boxen from "boxen";
import chalk from "chalk";
import open from "open";

import glide, { Options } from "../lib";
import { Environment, login } from "../oauth";
import { display, json, isDevEnv } from "../utilities";

export interface Flags {
  readonly environment: string;
  readonly port: number;
}

export default async function serve(path: string = "glide.json", flags: Flags): Promise<void> {
  process.env.NODE_ENV = flags.environment;

  const options = await configure(path);
  const listener = glide(options).listen(flags.port, () => {
    const address = display.address(listener);
    const message = [
      chalk`Config File: {underline ${path}}`,
      chalk`GraphQL Server: {underline ${address}}`,
      chalk`Salesforce Instance: {underline ${options.instance}}`,
    ];

    console.log(
      boxen(message.join(EOL), {
        float: "center",
        margin: 3,
        padding: 1,
      }),
    );

    if (isDevEnv()) {
      open(address).then(browser => browser.unref());
    }
  });

  process.once("SIGTERM", () => {
    listener.close();
  });

  return new Promise((resolve, reject) => {
    listener.once("close", resolve);
    listener.once("error", reject);
  });
}

async function configure(path: string): Promise<Options> {
  const options = await json.read<Options>(path);

  if (isDevEnv()) {
    options.connection = await login(
      options.instance,
      options.sandbox ? Environment.Default : Environment.Sandbox,
    );
  }

  return options;
}
