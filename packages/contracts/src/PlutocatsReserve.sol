// SPDX-License-Identifier: GPL-3.0

/// @title Plutocats Reserve; Supports UUPS upgrades

pragma solidity >=0.8.0;

import {IBlast} from "./interfaces/IBlast.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {IPlutocatsTokenMinimal} from "./interfaces/IPlutocatsTokenMinimal.sol";
import {IReserve} from "./interfaces/IReserve.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract PlutocatsReserve is IReserve, ReentrancyGuardUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using Address for address payable;

    /// The address of the pre-deployed Blast contract.
    address public constant BLAST_PREDEPLOY_ADDRESS = 0x4300000000000000000000000000000000000002;
    IBlast public blast;

    /// The address of the Plutocats token.
    IPlutocatsTokenMinimal public cats;

    constructor() initializer {}

    function initialize(address _cats, address _owner, address _blast) external initializer {
        __ReentrancyGuard_init();
        __Ownable_init();

        if (_blast != address(0)) {
            blast = IBlast(_blast);
        } else {
            blast = IBlast(BLAST_PREDEPLOY_ADDRESS);
        }

        blast.configureClaimableYield();
        cats = IPlutocatsTokenMinimal(_cats);

        if (_owner != address(0)) {
            _transferOwnership(_owner);
        }
    }

    /// Quit with pro rata share of the reserve.
    function quit(uint256[] calldata tokenIds) external nonReentrant {
        _quitInternal(tokenIds);
    }

    /// Internal function for leaving the club and claiming pro rata share.
    function _quitInternal(uint256[] calldata tokenIds) internal {
        uint256 totalSupply = cats.adjustedTotalSupply();
        if (totalSupply == 0) {
            revert NoCirculatingSupply();
        }

        // transfer the tokens from the user to the reserve. requires sender to
        // approve this contract. if duplicate tokens are provided this will fail
        // since transfer will check if from == token owner.
        for (uint256 i = 0; i < tokenIds.length; i++) {
            cats.transferFrom(msg.sender, address(this), tokenIds[i]);
        }

        uint256 ethToSend = (address(this).balance * tokenIds.length) / totalSupply;
        _sendETHInternal(payable(msg.sender), ethToSend);

        emit Quit(msg.sender, ethToSend, tokenIds);
    }

    /// Internal function for sending ETH.
    function _sendETHInternal(address payable recipient, uint256 ethToSend) internal {
        recipient.sendValue(ethToSend);
    }

    /// Sets the blast governor and releases this contract from any ownership.
    /// Note a call to this function is final and cannot be undone.
    function setGovernor(address _governor) external onlyOwner {
        blast.configureGovernor(_governor);
        emit SetBlastGovernor(_governor);
    }

    /// Claim all yield for the reserve. Can be called by anyone. Note if a new
    /// governor is configured for the reserve this function is no longer callable
    /// and yield can only be claimed by the configured Blast governor.
    function claimAllYield() external {
        address _this = address(this);
        uint256 amount = blast.claimAllYield(_this, _this);
        emit YieldClaimed(amount, _this);
    }

    /// Reverts when `msg.sender` is not the owner of this contract.
    function _authorizeUpgrade(address) internal view override onlyOwner {}

    /// Can receive ETH.
    receive() external payable {}
    fallback() external payable {}
}
