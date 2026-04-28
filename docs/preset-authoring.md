# Preset Authoring

Presets should stay conservative. A preset finding should tell users where install-time reality may diverge from package.json expectations; it should not invent packageExtensions from vibes.

## Rule Types

`watchRules` flag installed packages that deserve scrutiny in a given ecosystem. Use these for broad signals such as Hardhat, WalletConnect, Solana, and codegen stacks.

`majorAlignmentIdents` flag multiple installed major versions of packages where version splits are often meaningful.

`nativeBinaryIdents` flag packages that may need unplugging or extra runtime checks under PnP.

`packageExtensionRules` are for verified fixes only. Add one after reproducing a runtime failure and confirming which package performs the undeclared import.

## Package Extension Rule Checklist

Before adding a package extension rule:

- capture the failing package locator and stack trace
- confirm the import fails under PnP and succeeds when the missing dependency is added to that package
- keep the selector as narrow as practical
- add a fixture or analyzer test that explains why the rule exists
- prefer warnings and generated snippets before any automatic write behavior

## Example Shape

```ts
{
  ident: `example-package`,
  selector: `example-package@*`,
  reason: `example-package imports missing-runtime-helper without declaring it.`,
  dependencies: {
    "missing-runtime-helper": `*`,
  },
}
```
