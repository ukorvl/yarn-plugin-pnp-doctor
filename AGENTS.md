# AGENTS.md

This file is the shared operating guide for AI coding agents working in this repository.

## Project

PnP Doctor is a Yarn plugin that makes strict Plug'n'Play installs practical in real ecosystems.

The product mental model is: diagnose dependency compatibility at install-time reality, not package policy that Yarn constraints already cover.

The strongest first wedge is `yarn pnp-doctor --preset web3`.

## What To Build Toward

- Detect graph shapes that often break under Plug'n'Play.
- Suggest packageExtensions only when backed by a verified failing package.
- Keep the default command useful without requiring lifecycle hooks.
- Keep ecosystem presets conservative, inspectable, and easy to test.
- Make output useful for both humans and CI.

## Non-Goals

- Do not turn this into a general dependency security scanner.
- Do not duplicate Yarn constraints with different syntax.
- Do not add packageExtension rules from guesses, old blog posts, or vibes.
- Do not add broad automatic write behavior until generated YAML has fixtures.
- Do not hand-roll Yarn lockfile parsing when Yarn Project APIs can answer the question.

## Commands

Use Yarn from this project root.

```bash
yarn install
yarn lint
yarn lint:md-links
yarn typecheck
yarn test
yarn build
yarn verify:package
yarn check
```

Smoke-test the built plugin with:

```bash
YARN_PLUGINS=./bundles/@yarnpkg/plugin-pnp-doctor.js yarn pnp-doctor --preset web3 --severity warning
```

VS Code TypeScript resolution depends on Yarn's generated PnP SDK in `.yarn/sdks` and `.vscode/settings.json`. If editor module resolution breaks, regenerate it with:

```bash
yarn dlx @yarnpkg/sdks vscode
```

## Architecture Map

- `sources/index.ts` registers the Yarn plugin.
- `sources/commands/PnpDoctorCommand.ts` owns CLI flags, Yarn project loading, report output, and exit codes.
- `sources/core/analyzer.ts` owns pure diagnosis logic.
- `sources/core/yarnProject.ts` adapts Yarn's Project model into a testable snapshot.
- `sources/core/report.ts` owns severity filtering and text/JSON formatting.
- `sources/core/presets/` owns ecosystem preset data.
- `tests/` should test pure behavior first, then command behavior when it becomes worth the setup cost.
- `fixtures/` is reserved for minimal verified reproductions.

## Coding Rules

- Keep the command layer thin and push behavior into pure core modules.
- Prefer small typed data structures over string parsing.
- Preserve strict TypeScript settings.
- Keep public output stable and clear; tests should cover meaningful report behavior.
- Use ASCII unless a file already has a reason to use other characters.
- Avoid comments unless they explain a non-obvious decision.
- Do not edit generated bundles by hand.

## Preset Rules

Preset findings should explain risk and next steps without overstating certainty.

Only add a `packageExtensionRules` entry after all of these are true:

- A fixture or real project reproduces the PnP failure.
- The stack trace identifies which package performs the undeclared import.
- Adding the dependency to that package fixes the failure.
- The selector is as narrow as practical.
- A test or fixture documents the behavior.

For more detail, read `docs/preset-authoring.md`.

## Validation Expectations

For documentation-only changes, run:

```bash
git diff --check
```

For commit message policy changes, validate sample messages with:

```bash
echo "feat: add useful thing" | yarn commitlint
echo "oops" | yarn commitlint
```

Git hooks are managed by `simple-git-hooks`. After changing hook commands, run:

```bash
yarn hooks:install
```

The pre-commit hook runs `lint-staged` and formats staged JS, TS, JSON, Markdown, and YAML files with Prettier.

For source or package changes, run:

```bash
yarn typecheck
yarn test
yarn build
```

For npm package or publish workflow changes, also run:

```bash
yarn verify:package
```

For command behavior changes, also run the smoke test from this file.
