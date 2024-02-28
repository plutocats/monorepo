// SPDX-License-Identifier: GPL-3.0

/// @title An interface for Plutocats Token

pragma solidity >=0.8.0;

interface IPlutocatsTokenMinimal {
    function totalSupply() external view returns (uint256);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function burn(uint256 _tokenId) external;
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function isApprovedOrOwner(address _account, uint256 _tokenId) external view returns (bool);
    function getPriorVotes(address account, uint256 blockNumber) external view returns (uint96);
    function adjustedTotalSupply() external view returns (uint256);
    function setGovernor(address _governor) external;
}
