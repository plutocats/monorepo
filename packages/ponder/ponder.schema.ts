import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Mints: p.createTable({
    id: p.string(),
    msgSender: p.string(),
    tokenId: p.bigint(),
    amount: p.bigint(),
    seed: p.string(),
    ts: p.bigint(),
  }),
  MarketMints: p.createTable({
    id: p.string(),
    msgSender: p.string(),
    tokenId: p.bigint(),
    amount: p.bigint(),
    ts: p.bigint(),
  })
}));
