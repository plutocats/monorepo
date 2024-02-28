// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Plutocats Token

pragma solidity >=0.8.0;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IPlutocatsDescriptorMinimal} from "./IPlutocatsDescriptorMinimal.sol";
import {IPlutocatsSeeder} from "./IPlutocatsSeeder.sol";

interface IPlutocatsToken is IERC721 {
    struct Contribution {
        uint256 amount;
        uint256 joinTime;
    }

    event PlutocatPurchased(uint256 indexed tokenId, uint256 price, IPlutocatsSeeder.Seed seed);
    event ETHSent(address indexed to, uint256 amount);
    event DescriptorUpdated(address indexed newDescriptor);
    event SeederUpdated(address indexed newSeeder);
    event ReservePriceSet(bool on);
    event SetBlastGovernor(address indexed governor);

    error InsufficientFundsProvided();
    error DescriptorIsLocked();
    error SeederIsLocked();
    error OnlyReserve();
    error TokenDoesNotExist();
    error CallerIsNotOwnerOrApproved();

    function mint() external payable returns (uint256);
    function dataURI(uint256 tokenId) external returns (string memory);
    function setDescriptor(address descriptor) external;
    function setSeeder(address seeder) external;
    function setReservePrice(bool _enableReservePrice) external;
}
