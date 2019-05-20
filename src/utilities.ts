import fs from "fs";
import http from "http";
import { Server } from "net";
import { promisify } from "util";

import fetch, { Headers } from "cross-fetch";
import { Application } from "express";
import { camelCase } from "lodash";
import pluralize from "pluralize";

const customPrefix = /(?:__[a-z])$/;

export const exists = promisify(fs.exists);

export namespace display {
  export function address(server: Server): string {
    const info = server.address();
    const protocol = "http";

    if (info == null) {
      return "";
    }

    if (typeof info === "string") {
      return `${protocol}://${info}`;
    }

    switch (info.address) {
      case "127.0.0.1":
      case "0.0.0.0":
      case "::": {
        return `${protocol}://localhost:${info.port}`;
      }
      default: {
        return `${protocol}://${info.address}:${info.port}`;
      }
    }
  }
}

export namespace json {
  const readFile = promisify(fs.readFile);
  const writeFile = promisify(fs.writeFile);

  export async function post<T = any>(input: string, body: object): Promise<[T, Response]> {
    const response = await fetch(input, {
      body: JSON.stringify(body),
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });

    return [await response.json(), response];
  }

  export async function read<T = any>(path: string): Promise<T> {
    return JSON.parse(await readFile(path, "utf8"));
  }

  export async function write(path: string, json: any): Promise<void> {
    await writeFile(path, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  }
}

export namespace net {
  export async function listen(app: Application, port: number): Promise<[string, Server]> {
    const server = http.createServer(app);

    return new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, () => {
        server.off("error", reject);
        resolve([display.address(server), server]);
      });
    });
  }
}

export namespace string {
  export const { plural, singular } = pluralize;

  export function fieldify(input: string): string {
    return camelCase(normalize(input));
  }

  export function typeify(input: string): string {
    return pascalCase(normalize(input));
  }

  function normalize(input: string): string {
    return customPrefix.test(input) ? input.substr(0, input.length - 3) : input;
  }

  function pascalCase([first, ...rest]: string): string {
    return first.toUpperCase() + camelCase(rest.join(""));
  }
}

export function isDevEnv(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function mkdir(path: fs.PathLike): Promise<void> {
  return new Promise(resolve => {
    fs.mkdir(path, () => resolve());
  });
}
