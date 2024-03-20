# Plutocats Contracts

## Getting started
Ensure that you have Node.js and Foundry installed.

Install pnpm and all dependencies:
```
npm install -g pnpm
```
```
pnpm install
```

## Build the project
```
pnpm build
```

## Environment variables
A `.env` file must exist in this directory with the following variables:

`PRIVATE_KEY` - Private key of the account that will deploy the contracts.

## Run tests
Tests require forking blast sepolia to run properly. If you run into rate limit errors
using the default blast sepolia rpc a quicknode endpoint can be set in hardhat config.

```
pnpm test
```

## Deployed Contracts

The reserve earns Blast Points off its ETH balance and can periodically receive Blast Gold. 

Points Operator: `0x67e4476f31f1e1Cd773FC02d78869D14542b379a`

```
┌───────────────────────┬──────────────────────────────────────────────┬
│       ________        │                   Address                    │
├───────────────────────┼──────────────────────────────────────────────┼
│    NFTDescriptorV2    │ '0xA8C8e1B1937CEc4BB8cE41A74F1610784f5b7d73' │ 
│      SVGRenderer      │ '0xE9b7451fb9cC41Ed92AE5Ae0bF69c06AB74bE6c1' │ 
│  PlutocatsDescriptor  │ '0x9c2682B4D295a955FB546148967aA6ca1B66d2dC' │ 
│       Inflator        │ '0x66dbba99501b8e4AdC51E152163eAF27B44392Bf' │ 
│     PlutocatsArt      │ '0x8B070e260438cB97C49543e5D8f8Cf61c20B7A26' │ 
│    PlutocatsSeeder    │ '0xe571a5dD7b38298099d27E8943748b2D8572050B' │ 
│    PlutocatsToken     │ '0xF084962cdC640ED5c7d4e35E52929dAC06B60F7C' │ 
│   PlutocatsReserve    │ '0xe20b850C84EC0015aE498025eE1851859281515c' │ 
│ PlutocatsReserveProxy │ '0x4eA682B94B7e13894C3d0b9afEbFbDd38CdACc3C' │ 
│    ReserveGovernor    │ '0x8F0FE69903e90742336655d5fB3f8d4c7D033D66' │ 
│    MarketBuyer        │ '0x33184D366D46013c33aA3E46e9710221b83Ac400' │ 
└───────────────────────┴──────────────────────────────────────────────┴
```