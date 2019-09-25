#! /usr/bin/env node

import commander from "commander";

import init from "./commands/init";
import print from "./commands/print";
import serve from "./commands/serve";

export default function main(): void {
  commander.name("glide");
  commander.version("0.0.1");
  commander.description("GraphQL for Salesforce");

  commander
    .command("init <url> [path]")
    .description("generates a glide.json file in the current directory")
    .option("-s, --sandbox", "should be set if the given url points to a salesforce sandbox")
    .action(
      subcommand(async (origin, path, command) => {
        let output = path;

        if (output == null) {
          output = command.sandbox ? "glide.sandbox.json" : "glide.json";
        }

        await init(origin, output, command);
      }),
    );

  commander
    .command("print [path]")
    .description("prints a GraphQL schema based on the config file at the provided path")
    .action(subcommand(print));

  commander
    .command("serve [path]")
    .description("spawns a server based on the config file at the provided path")
    .option("-e, --environment [environment]", "", environment => environment, "development")
    .option("-p, --port [number]", "", port => +port, 8080)
    .action(subcommand(serve));

  commander.parse(process.argv);
}

function subcommand(action: (...args: any[]) => Promise<number | void>) {
  return async (...args: any[]) => {
    try {
      process.exit((await action(...args)) || 0);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  };
}

if (module === require.main) {
  main();
}
