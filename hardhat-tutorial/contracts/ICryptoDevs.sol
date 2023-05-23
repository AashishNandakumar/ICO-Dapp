// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

interface ICryptoDevs {
    // @dev Returns a tokenId owned by the owner at a given index
    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) external view returns (uint256 tokenId);

    // @dev Returns the no of tokens owned by the owner
    function balanceOf(address owner) external view returns (uint256);
}
