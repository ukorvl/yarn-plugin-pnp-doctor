# Fixtures

Fixture projects belong here once the plugin starts collecting verified ecosystem behavior.

Suggested first fixtures:

- `hardhat-ethers-v5-v6-split`
- `walletconnect-provider-browser-stack`
- `solana-native-binary-stack`
- `wagmi-abi-codegen`

Each fixture should include:

- the smallest package graph that reproduces the signal
- the command that fails or demonstrates the behavior
- the expected `yarn pnp-doctor --preset web3` finding
- any packageExtensions entry only after it has been verified

Current fixture template:

- `projects/web3-local-stack` is a fully local Yarn project used by tests to generate real installs under both `nodeLinker: pnp` and `nodeLinker: node-modules` without hitting the network.
