// SPDX-License-Identifier: GPL-3.0

/// This utility is not part of the Plutocats protocol and was created to provide
/// a way to mint Plutocats at market price under high demand.

pragma solidity >=0.8.0;

import {IPlutocatsToken} from "../interfaces/IPlutocatsToken.sol";
import {IBlast} from "../interfaces/IBlast.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract MarketBuyer {
    using Address for address payable;

    event Minted(uint256 tokenId, address owner, uint256 price);

    /// The address of the pre-deployed Blast contract.
    address public constant BLAST_PREDEPLOY_ADDRESS = 0x4300000000000000000000000000000000000002;
    IBlast public blast;

    IPlutocatsToken public plutocats;

    constructor(address _plutocats) {
        plutocats = IPlutocatsToken(_plutocats);
        blast = IBlast(BLAST_PREDEPLOY_ADDRESS);
        blast.configureClaimableGas();
        blast.configureGovernor(msg.sender);
    }

    function buy() external payable returns (uint256, uint256) {
        uint256 price = plutocats.getPrice();
        require(msg.value >= price, "payment too low");

        uint256 mintedId = plutocats.mint{value: price}();
        emit Minted(mintedId, msg.sender, price);

        plutocats.transferFrom(address(this), msg.sender, mintedId);

        uint256 refund = msg.value - price;
        if (refund > 0) {
            payable(msg.sender).sendValue(refund);
        }

        return (mintedId, price);
    }
}
