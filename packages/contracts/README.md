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