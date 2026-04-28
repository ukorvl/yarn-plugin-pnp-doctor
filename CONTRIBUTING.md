# Contributing

Thanks for helping improve PnP Doctor.

## Setup

```bash
yarn install
yarn hooks:install
```

The installed hooks format staged supported files with Prettier and validate commit messages with commitlint.

## Development

```bash
yarn lint
yarn lint:md-links
yarn typecheck
yarn test
yarn build
yarn verify:package
```

Run the built plugin locally with:

```bash
YARN_PLUGINS=./bundles/@yarnpkg/plugin-pnp-doctor.js yarn pnp-doctor --preset web3 --severity warning
```

## Preset Changes

Preset knowledge must be evidence-driven. Before adding a package extension rule, reproduce the failing package, identify the undeclared import, and add a test or fixture note.

See [Preset Authoring](./docs/preset-authoring.md).

## Commits

Commit messages are checked with commitlint. Use conventional commit types such as `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, and `ci`.

## Release Safety

Before publishing, run:

```bash
yarn check
yarn verify:package
```

Releases should publish through the GitHub release workflow so npm provenance and artifact attestations are generated.

By contributing, you agree your contributions are licensed under [MIT](./LICENSE).
