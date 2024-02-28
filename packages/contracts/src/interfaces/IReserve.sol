// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Plutocats Reserve

pragma solidity >=0.8.0;

interface IReserve {
    event Quit(address indexed msgSender, uint256 amount, uint256[] tokenIds);
    event SetBlastGovernor(address indexed governor);

    error NoCirculatingSupply();

    function setGovernor(address _governor) external;
    function quit(uint256[] calldata tokenIds) external;
}
