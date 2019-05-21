<p align="center">
  <img alt="Glide" src="../public/logo.png" height="139" width="264">
</p>

# Getting Started

This section of the guide helps you get up and running with a GraphQL server in a matter of seconds (depending on your internet connection). If you have already setup your project and are looking to dive deeper into Glide, you may find the [_Advanced Topics_](./advanced-topics.md) section of the guide more useful.

### Topics Covered

- [Installation](#Installation)
- [Project Setup](#Project%20Setup)
- [Executing GraphQL](#Executing%20GraphQL)

## Installation

Glide must be installed globally in order to use the bundled command-line tools.

```sh
# If you are using npm
npm install --global @postlight/glide

# If you are using yarn
yarn global add @postlight/glide
```

If you wish to keep your global namespace clean, you may alternatively use `npx`.

```sh
npx @postlight/glide <command> [...options]
```

## Project Setup

Glide uses a JSON configuration file to connect, read, and write data to and from your Salesforce instance. By default, this configuration is stored in a `glide.json` file located within the directory of your project.

When starting a new project or adding glide to an existing project, you may execute the `init` command with your Salesforce instance URL as the first argument. This will create a JSON configuration file in the current directory with schema definitions pre-populated from your Salesforce data models. The JSON configuration file _should_ be checked in to version control.

```sh
glide init https://my-salesforce-instance.salesforce.com
```

**Note:**

If you have not used Glide with your Salesforce instance before, you may be prompted to login. More information about how authentication works in Glide can be found in the [_Advanced Topics_](./advanced-topics.md) section of the guides.

## Executing GraphQL

Once you have a JSON configuration file in the root directory of your project, you may spawn a GraphQL server by executing the `serve` command. When executing the `serve` command in a development environment, your default browser will open a [GraphQL Playground](https://github.com/prisma/graphql-playground) playground page to start exploring your data.

You manually edit your JSON configuration file if you wish to modify the mutations, queries, and/or data types exposed by your GraphQL server. Information about how to configure the generated GraphQL schema can be found in the [_Advanced Topics_](./advanced-topics.md) section of the guides.

<img alt="GraphQL Playground" src="../public/demo.gif" width="980" />
