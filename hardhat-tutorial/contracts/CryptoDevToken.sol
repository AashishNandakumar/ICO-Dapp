// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./ICryptoDevs.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoDevToken is ERC20, Ownable {
    // set the price of one token
    uint256 public constant tokenPrice = 0.0001 ether;
    // Each NFT would give the user 10 tokens
    uint256 public constant tokensPerNFT = 10 * 10 ** 18;
    // setting the max no of tokens that will be minted
    uint256 public constant maxTotalSupply = 10000 * 10 ** 18;
    // creating an empty instance of ICryptoDevs contract
    ICryptoDevs CryptoDevsNFT;
    // Keep a mapping to keep track of which tokenIds have been claimed:
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _cryptoDevsContract) ERC20("Crypto Dev Token", "CD") {
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
    }

    // @dev Function to mint when an amount of ether is deposited
    function Mint(uint256 noOfTokens) public payable {
        // compute the required amount
        uint256 _requiredAmount = tokenPrice * noOfTokens;
        require(msg.value >= _requiredAmount, "Insufficient Ether sent!");

        uint256 amountWithDecimals = noOfTokens * 10 ** 18;
        require(
            (totalSupply() + amountWithDecimals) <= maxTotalSupply,
            "Maximum number of tokens have been minted!"
        );
        // call the internal fxn from ERC20 contract
        _mint(msg.sender, amountWithDecimals);
    }

    // @dev Mints the token depending on the NFT held by the user
    function claim() public {
        address sender = msg.sender;
        //  get the no of NFTs held by this address
        uint256 balance = CryptoDevsNFT.balanceOf(sender);
        // make sure th no of NFTS held is not zero
        require(balance > 0, "No NFTs held by this address");
        // keep a track of un-claimed tokenIds
        uint256 amount = 0;
        // loop over the list of token ids and obtain a particular token based on the index
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
            // check if this tokenId is claimed
            if (!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        // if all the tokenIds are claimed then u cant clasim a new token
        require(amount > 0, "You have claimed all the tokens");
        // call the internal fxn to mint
        _mint(msg.sender, amount * tokensPerNFT);
    }

    // @dev Withdraw all the ETH from the contract
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, contract balance empty");

        address _owner = owner();
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    // Fxns to recieve ETH
    receive() external payable {}

    fallback() external payable {}
}
