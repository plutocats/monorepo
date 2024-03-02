/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';
import '@nomiclabs/hardhat-waffle';
import '@nomicfoundation/hardhat-verify';
import 'solidity-coverage';
import '@typechain/hardhat';
import 'hardhat-abi-exporter';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-gas-reporter';
import './tasks';
import '@nomicfoundation/hardhat-foundry';

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    anvil: {
      url: `http://127.0.0.1:8545`,
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.POINTS_OP_PRIVATE_KEY!
      ],
      chainId: 168587773,
      gasPrice: 1000000000,
    },
    hardhat: {
      initialBaseFeePerGas: 0,
      forking: {
        enabled: true,
        url: 'https://sepolia.blast.io',
        blockNumber: 2582350
      },
    },
    blast_sepolia: {
      url: 'https://sepolia.blast.io',
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.POINTS_OP_PRIVATE_KEY!
      ]
    },
    blast: {
      url: 'https://sepolia.blast.io',
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.POINTS_OP_PRIVATE_KEY!
      ]
    },
  },
  // @ts-ignore
  etherscan: {
    apiKey: {
      blast_sepolia: process.env.ETHERSCAN_API_KEY!,
      blast: process.env.ETHERSCAN_API_KEY!,
    },
    customChains: [
      {
        network: "blast_sepolia",
        chainId: 168587773,
        urls: {
          apiURL: "https://api-sepolia.blastscan.io/api",
          browserURL: "https://sepolia.blastscan.io/"
        }
      },
      {
        network: "blast",
        chainId: 81457,
        urls: {
          apiURL: "https://api.blastscan.io/api",
          browserURL: "https://blastscan.io/"
        }
      }
    ]
  },
  abiExporter: {
    path: './abi',
    clear: true,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  gasReporter: {
    enabled: !process.env.CI,
    currency: 'USD',
    gasPrice: 1,
    src: 'contracts',
    coinmarketcap: '7643dfc7-a58f-46af-8314-2db32bdd18ba',
  },
  mocha: {
    timeout: 60_000,
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache-hardhat",
    artifacts: "./abi"
  },
};
export default config;