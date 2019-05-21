<p align="center">
  <img alt="Glide" src="../public/logo.png" height="139" width="264">
</p>

# Advanced Topics

This section of the guide dives deeper into how you may configure Glide to suit your needs. If you have yet to setup your project, you may find the [_Getting Started_](./getting-started.md) section of the guide more useful.

### Topics Covered

- [Authentication](#Authentication)
- [Express Middleware](#Express%20Middleware)
- [Schema Customization](#Schema%20Customization)

## Authentication

Learn the ins-and-outs of how authentication and security are handled in Glide.

### In Development

In order for Glide to read and/or write to your Salesforce instance, you must first authenticate the CLI as user with sufficient permissions. Once you have authenticated successfully, an OAuth 2.0 refresh token will be cached in `$HOME/.glide/credentials.json` for subsequent commands executed against the given Salesforce instance. In the event that you are unable to authenticate into your Salesforce instance with a cached refresh token, you may manually delete the entry from `$HOME/.glide/credentials.json`.

When executing the `serve` command in a development environment, each request to your GraphQL server will be authenticated as the user of the command-line tool. This prevents you from having to obtain and pass an OAuth 2.0 access token in the `Authentication` header of each HTTP request. You may read more about how to authenticate and secure a production deploy of Glide in the section below.

### In Production

When running the serve command in production, be sure to pass `--environment=production`. Doing so prevents Glide from using the cached refresh token of the CLI user. It is expected that authentication is handled by the client and the access token is passed in the `Authorization` header of each HTTP request.

```http
Authorization: Bearer <access-token>
```

## Express Middleware

Glide can also be used as part of an existing express application. To do so, add `@postlight/glide` to the `dependencies` section of your existing express application and follow the usage example below.

```javascript
import fs from "fs";
import path from "path";

import glide from "@postlight/glide";
import express from "express";

const server = express();

function readConfig(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf8"));
}

server.use("/graphql", glide(readConfig("glide.json")));
```

### Schema Customization

_TODO_
