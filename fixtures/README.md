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
