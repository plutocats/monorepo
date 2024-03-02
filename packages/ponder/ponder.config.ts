import { createConfig } from "@ponder/core";
import { http } from "viem";

import PlutocatsTokenABI from "./abis/PlutocatsToken";
import MarketBuyerABI from "./abis/MarketBuyer";

export default createConfig({
  networks: {
    blast: {
      chainId: Number(process.env.CHAIN_ID!),
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    PlutocatsToken: {
      network: "blast",
      abi: PlutocatsTokenABI,
      address: process.env.TOKEN_ADDRESS! as `0x${string}`,
      startBlock: 811750,
    },
    MarketBuyer: {
      network: "blast",
      abi: MarketBuyerABI,
      address: process.env.MARKET_BUYER_ADDRESS! as `0x${string}`,
      startBlock: 811750,
    }
  },
});
