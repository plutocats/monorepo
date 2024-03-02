import { ponder } from "@/generated";
import crypto from "crypto";

ponder.on("PlutocatsToken:PlutocatPurchased", async ({ event, context }) => {
    const { Mints } = context.db;
    await Mints.create({
        id: crypto.randomBytes(16).toString('hex'),
        data: {
            tokenId: event.args.tokenId,
            msgSender: event.args.msgSender,
            seed: JSON.stringify(event.args.seed),
            amount: event.args.price,
            ts: event.block.timestamp,
        }
    });
});

ponder.on("MarketBuyer:Minted", async ({ event, context }) => {
    const { MarketMints } = context.db;
    await MarketMints.create({
        id: crypto.randomBytes(16).toString('hex'),
        data: {
            tokenId: event.args.tokenId,
            msgSender: event.args.owner,
            amount: event.args.price,
            ts: event.block.timestamp,
        }
    });
});