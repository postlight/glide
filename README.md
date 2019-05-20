<p align="center">
  <img width="264" height="139" src="./public/logo.png">
</p>

<h2 align="center">GraphQL for Salesforce</h2>
<h1 align="center"></h1>

Execute idiomatic GraphQL against _any_ Salesforce instance with a single command.

## Usage

### Installation

```sh
yarn global add @postlight/glide
```

OR

```sh
npm install --global @postlight/glide
```

### Project Setup

Glide uses a JSON config file to map GraphQL operations to requests to your Salesforce instance. If you are setting up your project for the first time, you must first run the `init` generate a `glide.json` file.

```sh
glide init <salesforce-instance-url>
```

### Serving Requests

```sh
glide serve [path/to/glide.json]
```

## License

Licensed under either of

- Apache License, Version 2.0
  ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license
  ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
