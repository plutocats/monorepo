import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { NounSeed, NounData } from './types';
import { images, bgcolors, palette } from './image-data.json';
import { buildSVG } from "./image";

const { bodies, accessories, heads, glasses, eyes } = images;

type ObjectKey = keyof typeof images;

/**
 * Get encoded part and background information using a Noun seed
 * @param seed The Noun seed
 */
export const getNounData = (seed: NounSeed): NounData => {
  return {
    parts: [
      bodies[seed.body],
      accessories[seed.accessory],
      heads[seed.head],
      eyes[seed.eyes],
      glasses[seed.glasses],
    ],
    background: bgcolors[seed.background],
  };
};

/**
 * Generate a random Noun seed
 * @param seed The Noun seed
 */
export const getRandomNounSeed = (): NounSeed => {
  return {
    background: Math.floor(Math.random() * bgcolors.length),
    body: Math.floor(Math.random() * bodies.length),
    accessory: Math.floor(Math.random() * accessories.length),
    head: Math.floor(Math.random() * heads.length),
    eyes: Math.floor(Math.random() * eyes.length),
    glasses: Math.floor(Math.random() * glasses.length),
  };
};

/**
 * Emulate bitwise right shift and uint cast
 * @param value A Big Number
 * @param shiftAmount The amount to right shift
 * @param uintSize The uint bit size to cast to
 */
export const shiftRightAndCast = (
  value: BigNumberish,
  shiftAmount: number,
  uintSize: number,
): string => {
  const shifted = BigNumber.from(value).shr(shiftAmount).toHexString();
  return `0x${shifted.substring(shifted.length - uintSize / 4)}`;
};

/**
 * Emulates the NounsSeeder.sol methodology for pseudorandomly selecting a part
 * @param pseudorandomness Hex representation of a number
 * @param partCount The number of parts to pseudorandomly choose from
 * @param shiftAmount The amount to right shift
 * @param uintSize The size of the unsigned integer
 */
export const getPseudorandomPart = (
  pseudorandomness: string,
  partCount: number,
  shiftAmount: number,
  uintSize = 48,
): number => {
  const hex = shiftRightAndCast(pseudorandomness, shiftAmount, uintSize);
  return BigNumber.from(hex).mod(partCount).toNumber();
};

/**
 * Emulates the NounsSeeder.sol methodology for generating a Noun seed
 * @param nounId The Noun tokenId used to create pseudorandomness
 * @param blockHash The block hash use to create pseudorandomness
 */
export const getNounSeedFromBlockHash = (nounId: BigNumberish, blockHash: string): NounSeed => {
  const pseudorandomness = solidityKeccak256(['bytes32', 'uint256'], [blockHash, nounId]);
  return {
    background: getPseudorandomPart(pseudorandomness, bgcolors.length, 0),
    body: getPseudorandomPart(pseudorandomness, bodies.length, 48),
    accessory: getPseudorandomPart(pseudorandomness, accessories.length, 96),
    head: getPseudorandomPart(pseudorandomness, heads.length, 144),
    eyes: getPseudorandomPart(pseudorandomness, eyes.length, 192),
    glasses: getPseudorandomPart(pseudorandomness, glasses.length, 0),
  };
};

/**
 * Get encoded part information for one trait
 * @param partType The label of the part type to use
 * @param partIndex The index within the image data array of the part to get
 */
export const getPartData = (partType: string, partIndex: number): string => {
  const part = partType as ObjectKey;
  return images[part][partIndex].data;
};

/// Generate a silhouette svg for the given id and blockhash
export const getPendingCat = (nounId: number, blockhash: string, fill = "", bg = "") => {
  const seed = getNounSeedFromBlockHash(nounId, blockhash);
  const { parts } = getNounData(seed);
  const s = palette.map(_ => fill);
  const svgBinary = buildSVG(parts, s, bg);
  return { src: `data:image/svg+xml;base64,${btoa(svgBinary)}`, seed };
};

/// Render an svg from the given seed
export const getFromSeed = (seed: NounSeed) => {
  const { parts, background } = getNounData(seed);
  const svgBinary = buildSVG(parts, palette, background);
  return { src: `data:image/svg+xml;base64,${btoa(svgBinary)}`, seed };
};

export const bgColors = bgcolors;