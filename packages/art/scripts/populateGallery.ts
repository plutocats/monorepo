/**
 * For you to implement:
   - hook up providers with ether/web3.js
   - get currently auctioned Noun Id from the NounsAuctionHouse contract
   - add 1 to the current Noun Id to get the next Noun Id (named `nextNounId` below)
   - get the latest block hash from your provider (named `latestBlockHash` below)
*/

import { ImageData, getNounSeedFromBlockHash, getNounData } from '../src';
import { buildSVG } from '@nouns/sdk';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { promises as fs } from 'fs';
import path from 'path';
const { palette } = ImageData;

const DESTINATION = path.join(__dirname, '../gallery');
const main = async () => {
    const client = createPublicClient({
        chain: mainnet,
        transport: http()
    });

    let block = await client.getBlock({ blockTag: 'latest' });
    let blockNumber = block.number;
    let nounId = 0;

    for (let i = 0; i < 1000; i++) {
        const blockHash = block.hash;
        const seed = getNounSeedFromBlockHash(nounId, blockHash);
        const { parts, background } = getNounData(seed);
        const svg = buildSVG(parts, palette, background);
        await fs.writeFile(path.join(DESTINATION, `${nounId}.svg`), svg);

        blockNumber = blockNumber - BigInt(1);
        nounId = nounId + 1;
        block = await client.getBlock({ blockNumber: blockNumber });
    }
};


main();