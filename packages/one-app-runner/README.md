# @americanexpress/one-app-runner

> A command line interface (CLI) tool for running [One App](https://github.com/americanexpress/one-app) locally.

**one-app-runner** allows you to work locally on your [Holocron Module](https://github.com/americanexpress/one-app/blob/master/docs/api/API.md#modules) without having to clone [One App](https://github.com/americanexpress/one-app).

It works by pulling a Docker image for One App and mounting your module to it as a volume.

**Note:** If you are making changes to One App at the same time you are making changes to your Module(s) then you will still need to [clone One App, serve your module to it, and start it yourself](https://github.com/americanexpress/one-app).

## 🤹‍ Usage

Note that [Docker](https://www.docker.com/products/docker-desktop) is required and must be installed before **one-app-runner** can be used.

### Quick start

In any [Holocron Module](https://github.com/americanexpress/one-app/blob/master/docs/api/API.md#modules) directory:

1. Install:
```bash
npm install --save-dev @americanexpress/one-app-runner
```

2. Add the `one-app-runner` command to your `npm` start script and a runner config to your module's
`package.json`. See below for an example:

##### package.json
```json
"scripts": {
  "start": "one-app-runner"
},
"one-amex": {
  "runner": {
    "modules": ["."],
    "rootModuleName": "frank-lloyd-root",
    "moduleMapUrl": "https://example.com/cdn/module-map.json",
    "dockerImage": "one-app-dev:5.0.0",
    "parrotMiddleware": "./dev.middleware.js"
  }
}
```

Use the runner config to tell `one-app-runner` what module map and One App version to use, what your root module is, where your module is (current directory in this case), and optionally where your [Parrot mocks](https://github.com/americanexpress/one-app/blob/master/docs/recipes/Mocking-API-Calls.md) middleware file is located.

##  Command options reference

**one-app-runner** can be configured via command options or a configuration object in `package.json`:

### docker-image [Required]

Docker image to use for One App. It allows you to specify what Docker image and tag to pull down for One App. This can be an
image you have built and tagged locally but is not published to a Docker registry. Whatever value is
provided is passed down to `docker pull` and `docker run`.

Sample usage:

```bash
npx @americanexpress/one-app-runner --docker-image one-app-dev:5.0.0 --module-map-url https://example.com/cdn/module-map.json
```

Or in `package.json`

```json
"one-amex": {
  "runner": {
    "dockerImage": "one-app-dev:5.0.0",
    "rootModuleName": "frank-lloyd-root",
    "moduleMapUrl": "https://example.com/cdn/module-map.json"
  }
}
```

### module-map-url

Location of module map for One App to use to fetch modules. This option is required.

Sample usage:

```bash
npx @americanexpress/one-app-runner --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json
```

Or in `package.json`

```json
"one-amex": {
  "runner": {
    "moduleMapUrl": "https://example.com/cdn/module-map.json",
    "dockerImage": "dockerhub.com/oneamex/one-app-dev:5.0.0",
    "rootModuleName": "frank-lloyd-root"
  }
}
```

### root-module-name [Required]

Name of the module to use as a [root module](https://github.com/americanexpress/one-app#the-root-module)
for your One App instance.

Sample usage:

```bash
npx @americanexpress/one-app-runner --root-module-name frank-lloyd-root --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json
```

Or in `package.json`

```json
"one-amex": {
  "runner": {
    "rootModuleName": "frank-lloyd-root",
    "moduleMapUrl": "https://example.com/cdn/module-map.json",
    "dockerImage": "one-app-dev:5.0.0",
  }
}
```

### modules [Optional]

>This option is required if module-map-url is not provided.

Path to local module(s) to serve to One App. This can be either an absolute or a relative path to a Holocron Module's
root directory. Supports serving multiple modules at the same time as well.

Sample usage:

```bash
npx @americanexpress/one-app-runner --modules ../frank-lloyd-root --root-module-name frank-lloyd-root --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json

# or to serve multiple modules
npx @americanexpress/one-app-runner --modules ../frank-lloyd-root ../cultured-frankie --root-module-name frank-lloyd-root --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json
```

Or in `package.json`

```json
"one-amex": {
  "runner": {
    "modules": [
      ".",
      "../frank-lloyd-root"
    ],
    "rootModuleName": "frank-lloyd-root",
    "moduleMapUrl": "https://example.com/cdn/module-map.json",
    "dockerImage": "one-app-dev:5.0.0",
  }
}
```

### parrot-middleware [Optional]

Path to parrot dev middleware file for One App to use for Parrot mocking. This option must be used in conjunction with the `--module` option.

For more information on setting up parrot dev middleware, check out the [One App Mocking APIs recipe](https://github.com/americanexpress/one-app/blob/master/docs/recipes/Mocking-API-Calls.md).

Sample usage:

```bash
npx @americanexpress/one-app-runner --parrot-middleware ../frank-lloyd-root/dev.middleware.js --module ../frank-lloyd-root --root-module-name frank-lloyd-root --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json
```

Or in `package.json`

```json
"one-amex": {
  "runner": {
    "parrotMiddleware": "./dev.middleware.js",
    "modules": ["."],
    "rootModuleName": "frank-lloyd-root",
    "moduleMapUrl": "https://example.com/cdn/module-map.json",
    "dockerImage": "one-app-dev:5.0.0",
  }
}
```

If middleware is defined in the `package.json`, you can use the `--no-parrot-middleware` option to temporarily disable it.

### dev-endpoints [Optional]

Path to dev endpoints file for One App to use for the One App Dev Proxy set up. This option must be used in conjunction with the `--module` option.

For more information on setting up your dev endpoints file, check out the [Configuring One App with your API URLs guide](https://github.com/americanexpress/one-app/blob/master/docs/recipes/Mocking-API-Calls.md).

Sample usage:

```bash
npx @americanexpress/one-app-runner --dev-endpoints ../frank-lloyd-root/dev.endpoints.js --module ../frank-lloyd-root --root-module-name frank-lloyd-root --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json
```

Or in `package.json`

```json
"one-amex": {
  "runner": {
    "devEndpoints": "./dev.endpoints.js",
    "modules": ["."],
    "rootModuleName": "frank-lloyd-root",
    "moduleMapUrl": "https://example.com/cdn/module-map.json",
    "dockerImage": "one-app-dev:5.0.0",
  }
}
```

### output-file [Optional]

Path to a file to which One App logs should be redirected to. Using this option will send all One App logs to given file and will result in no logs from One App being sent to your terminal.

Sample usage:

```bash
npx @americanexpress/one-app-runner --output-file ../one-app.log --root-module-name frank-lloyd-root --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json  --module ../frank-lloyd-root
```

Or in `package.json`

```json
"one-amex": {
  "runner": {
    "outputFile": "./one-app.log",
    "modules": ["."],
    "rootModuleName": "frank-lloyd-root",
    "moduleMapUrl": "https://example.com/cdn/module-map.json",
    "oneAppVersion": "5.0.0"
  }
}
```

### envVars [Optional]

Environment variables to provide to One App instance.

Sample usage:

```bash
npx @americanexpress/one-app-runner --envVars '{ "ONE_CONFIG_ENV": "production" }' --root-module-name frank-lloyd-root --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json
// or
npx @americanexpress/one-app-runner --envVars.ONE_CONFIG_ENV=production --root-module-name frank-lloyd-root --one-app-version 5.0.0 --module-map-url https://example.com/cdn/module-map.json
```

Or in `package.json`

```json
"one-amex": {
  "runner": {
    "envVars": {
      "ONE_CONFIG_ENV": "production"
    },
    "rootModuleName": "frank-lloyd-root",
    "moduleMapUrl": "https://example.com/cdn/module-map.json",
    "oneAppVersion": "5.0.0"
  }
}
```

## Proxy Support

`one-app-runner` respects the HTTP_PROXY, HTTPS_PROXY, and NO_PROXY environment variables and passes them down to the One App docker container.

Make use of these environment variables if the remote module map or modules you want One App to use are inaccessible without the use of a proxy server.