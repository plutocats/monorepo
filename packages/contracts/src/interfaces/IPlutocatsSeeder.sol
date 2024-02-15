// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Plutocats Seeder

pragma solidity >=0.8.0;

import {IPlutocatsDescriptorMinimal} from "./IPlutocatsDescriptorMinimal.sol";

interface IPlutocatsSeeder {
    struct Seed {
        uint48 background;
        uint48 body;
        uint48 accessory;
        uint48 head;
        uint48 eyes;
        uint48 glasses;
    }

    function generateSeed(uint256 tokenId, IPlutocatsDescriptorMinimal descriptor)
        external
        view
        returns (Seed memory);
}
