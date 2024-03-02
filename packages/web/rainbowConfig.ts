import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";
import { anvil, mainnet, optimism } from "wagmi/chains";
import { http, createConfig } from '@wagmi/core';

const blast = /*#__PURE__*/ defineChain({
    id: 81457,
    name: 'Blast',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_MAINNET_RPC_URL!]
        },
    },
    blockExplorers: {
        default: { name: 'Blastscan', url: 'https://blastscan.io' },
    },
    contracts: {
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            blockCreated: 212929,
        },
    },
    sourceId: 1,
});

export const blastSepolia = /*#__PURE__*/ defineChain({
    id: 168_587_773,
    name: 'Blast Sepolia',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blastscan',
            url: 'https://testnet.blastscan.io',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 756690,
        },
    },
    testnet: true,
    sourceId: 11_155_111,
});


export const getChains = (): any => {
    const env = process.env.NEXT_PUBLIC_ENV;
    switch (env) {
        case "production":
            return [blast];
        case "staging":
            return [blastSepolia];
        default:
            const localAnvil = { ...anvil, id: blastSepolia.id };
            return [localAnvil];
    }
};

export const config = getDefaultConfig({
    appName: "Plutocats",
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    chains: getChains(),
    ssr: true,
    pollingInterval: 500,
});

export const mainnetConfig = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(),
    },
    ssr: true
});