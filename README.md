# Codebox Live packages

This repository is a series of Node packages for the Codebox Live sandbox.

## Packages overview

### @codeboxlive/extensions-core

Core extension package for use in Codebox Live sandbox projects to communicate with the Codebox Live application.

### @codeboxlive/extensions-fluid

Fluid extension package for use in Codebox Live sandbox projects to use Fluid and/or Live Share.

### @codeboxlive/hub-interfaces

Core interfaces used in Codebox Live gateways.

### @codeboxlive/projects-core

The Window Gateway Hub implementation for use in the Codebox Live web application.

### @codeboxlive/window-gateway

This package is a simple package designed to make window post messages bi-directional using promises, ensuring that the child and parent are using a shared set of interfaces to communicate securely. For it to work, both a parent and child window must implement the `WindowGatewayHub` class in this package.

## Build packages & samples for local testing

### npm

```bash
npm install
npm run build
```

## Credit

- [Sandpack](https://github.com/codesandbox/sandpack) is used for real-time app bundling and hot-reloading.
- [Monaco editor](https://github.com/microsoft/monaco-editor) is used as the code text editor.
- [Microsoft Live Share](https://www.github.com/microsoft/live-share-sdk) for synchronization in Teams.
- [Fluid Framework](https://github.com/microsoft/fluidframework) for powering Live Share and Monaco sample inspiration.
- [Fluent UI](https://github.com/microsoft/fluentui) for a solid React component library.

## License

Licensed under the [MIT](LICENSE) License, except for dependencies which have various licenses.
