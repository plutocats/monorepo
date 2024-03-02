import { query } from "./query";
import { GraphQLError } from "./errors"
import { cache } from "react"

export const getAllMints = async () => {
  const mints = await getMints();
  const marketMints = await getMarketMints();

  const normalized = (mints || []).map(m => {
    for (let i = 0; i < marketMints.length; i++) {
      if (m.tokenId === marketMints[i].tokenId) {
        return Object.assign({}, m, marketMints[i], { turbo: true });
      }
    }

    return m;
  })

  return normalized;
}

export const getMints = cache(async () => {
  const q = `
    query getMints {
      mintss(orderBy: "tokenId", limit: 20, orderDirection:"desc") {
        items {
          msgSender,
          id,
          tokenId,
          amount
        }
      }
    }
  `

  try {
    const res = (await query(q));
    if (res.errors) {
      throw new GraphQLError(res);
    }

    const mints = res.data.mintss.items;
    return mints || [];
  } catch (e) { return [] }
})

export const getMarketMints = cache(async () => {
  const q = `
    query getMarketMints{
      marketMintss(orderBy: "tokenId", limit: 20, orderDirection:"desc") {
        items{
          msgSender,
          id,
          tokenId,
          amount
        }
      }
    }
  `

  try {
    const res = (await query(q));
    if (res.errors) {
      throw new GraphQLError(res);
    }

    const mints = res.data.marketMintss.items;
    return mints || [];
  } catch (e) { return [] }
})