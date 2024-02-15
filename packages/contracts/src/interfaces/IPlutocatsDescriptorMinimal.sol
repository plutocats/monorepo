// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Plutocats Descriptor Minimal

pragma solidity >=0.8.0;

import {IPlutocatsSeeder} from "./IPlutocatsSeeder.sol";

interface IPlutocatsDescriptorMinimal {
    ///
    /// USED BY TOKEN
    ///
    function tokenURI(uint256 tokenId, IPlutocatsSeeder.Seed memory seed) external view returns (string memory);
    function dataURI(uint256 tokenId, IPlutocatsSeeder.Seed memory seed) external view returns (string memory);

    ///
    /// USED BY SEEDER
    ///
    function backgroundCount() external view returns (uint256);
    function bodyCount() external view returns (uint256);
    function accessoryCount() external view returns (uint256);
    function headCount() external view returns (uint256);
    function eyesCount() external view returns (uint256);
    function glassesCount() external view returns (uint256);
}
