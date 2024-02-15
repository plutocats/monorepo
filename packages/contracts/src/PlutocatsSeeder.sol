// SPDX-License-Identifier: GPL-3.0

/// @title Plutocats Seeder
/// Includes modifications for new traits
/// Based on Nouns https://github.com/nounsDAO/nouns-monorepo/blob/master/packages/nouns-contracts/contracts/NounsSeeder.sol

pragma solidity >=0.8.0;

import {IPlutocatsSeeder} from "./interfaces/IPlutocatsSeeder.sol";
import {IPlutocatsDescriptorMinimal} from "./interfaces/IPlutocatsDescriptorMinimal.sol";

contract PlutocatsSeeder is IPlutocatsSeeder {
    /// Generate a pseudo-random seed for a given tokenId.
    function generateSeed(uint256 tokenId, IPlutocatsDescriptorMinimal descriptor)
        external
        view
        override
        returns (Seed memory)
    {
        uint256 pseudorandomness = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), tokenId)));

        uint256 backgroundCount = descriptor.backgroundCount();
        uint256 bodyCount = descriptor.bodyCount();
        uint256 accessoryCount = descriptor.accessoryCount();
        uint256 headCount = descriptor.headCount();
        uint256 eyesCount = descriptor.eyesCount();
        uint256 glassesCount = descriptor.glassesCount();

        return Seed({
            background: uint48(uint48(pseudorandomness) % backgroundCount),
            body: uint48(uint48(pseudorandomness >> 48) % bodyCount),
            accessory: uint48(uint48(pseudorandomness >> 96) % accessoryCount),
            head: uint48(uint48(pseudorandomness >> 144) % headCount),
            eyes: uint48(uint48(pseudorandomness >> 192) % eyesCount),
            glasses: uint48(uint48(pseudorandomness) % glassesCount)
        });
    }
}
