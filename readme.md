<div align="center">
  <img
  alt=""
  src="https://raw.githubusercontent.com/ukorvl/design/master/yarn-plugin-pnp-doctor/logo.png"
  loading="lazy"
  height="200"
/>
  <p>PnP Doctor is a Yarn plugin for diagnosing dependency graph shapes that are likely to cause Plug'n'Play compatibility trouble.</p>
</div>

- inspect the resolved Yarn project graph
- flag ecosystem hotspots that deserve extra attention under PnP
- suggest package extension follow-ups where a preset knows enough to be confident
- emit either human output or JSON for CI/prototyping

It is deliberately not a general security scanner, not a replacement for Yarn constraints, and not a giant framework. The sweet spot is install-time reality: transitive graph behavior, package extension candidates, and ecosystem preset knowledge.

## Commands

```bash
yarn pnp-doctor
yarn pnp-doctor --preset web3
yarn pnp-doctor --preset web3 --json
yarn doctor pnp --severity warning
```

## Options

| Option               | Default   | Purpose                                                                              |
| -------------------- | --------- | ------------------------------------------------------------------------------------ |
| `--preset <name>`    | `default` | Enables preset checks. Current presets: `default`, `web3`.                           |
| `--severity <level>` | `info`    | Filters output to `info`, `warning`, or `error`.                                     |
| `--fail-on <level>`  | `error`   | Exits non-zero when a finding reaches this severity. Use `none` to always exit zero. |
| `--json`             | `false`   | Writes the full report as JSON.                                                      |

## Local Development

```bash
yarn install
yarn hooks:install
yarn lint
yarn typecheck
yarn test
yarn build
```

Hooks are managed by `simple-git-hooks`. The `pre-commit` hook formats staged supported files with Prettier. The `commit-msg` hook runs commitlint, and accepted types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`.

This repo uses Yarn Plug'n'Play. For VS Code, install the recommended ZipFS extension, then use the workspace TypeScript version when prompted. The PnP-aware TypeScript SDK is committed under `.yarn/sdks` and configured in `.vscode/settings.json`.

The build creates a standalone plugin bundle under `bundles/`. Import that generated file into a Yarn project:

```bash
yarn plugin import ./bundles/@yarnpkg/plugin-pnp-doctor.js
yarn pnp-doctor --preset web3
```

## Package Verification

Verify the npm package before release:

```bash
yarn verify:package
```

Publishing is handled by the GitHub release workflow. It builds the plugin bundle, packs the npm tarball, generates an SBOM, attests the package artifact, and publishes with npm provenance.

## MVP Scope

V1 should stay sharp:

- detect PnP mode and graph availability
- inspect resolved packages rather than package.json policy alone
- ship conservative ecosystem presets, starting with web3
- print actionable package-level findings
- keep package extension generation explicit and reviewable

Good next steps:

- add verified package extension rules from real failing fixtures
- add `--write` only after the generated YAML is battle-tested
- add fixture projects for Hardhat, WalletConnect, Solana, and codegen stacks
- publish preset packs separately once the knowledge base grows
