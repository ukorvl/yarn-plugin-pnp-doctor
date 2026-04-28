---
applyTo: "{sources/**/*.ts,tests/**/*.ts,package.json,.yarnrc.yml}"
---

# Yarn Plugin Work

This project is a Yarn plugin, not a normal library package.

- The plugin entry is `sources/index.ts`.
- `sources/commands/PnpDoctorCommand.ts` should stay focused on CLI flags, Yarn project loading, output, and exit codes.
- Analyzer behavior belongs in `sources/core/analyzer.ts` and should be testable without a Yarn project.
- Yarn Project adaptation belongs in `sources/core/yarnProject.ts`.
- Report formatting belongs in `sources/core/report.ts`.
- Preset data belongs in `sources/core/presets/`.

Validation for source changes:

```bash
yarn typecheck
yarn test
yarn build
```

Smoke-test command behavior with:

```bash
YARN_PLUGINS=./bundles/@yarnpkg/plugin-pnp-doctor.js yarn pnp-doctor --preset web3 --severity warning
```
