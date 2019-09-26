export enum Environment {
  Default = "default",
  Sandbox = "sandbox",
}

export namespace Environment {
  export function from(input?: string): Environment {
    switch (input) {
      case Environment.Sandbox: {
        return Environment.Sandbox;
      }
      default: {
        return Environment.Default;
      }
    }
  }
}

export const enum MessageType {
  Authenticated = "AUTHENTICATED",
  Initialize = "INITIALIZE",
}
