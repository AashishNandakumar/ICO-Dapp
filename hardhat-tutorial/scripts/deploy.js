const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { CRYPTO_DEVS_NFT_CONTRACT_ADDRESS } = require("../constants/index");

async function main() {
  // get the address of crypto-devs-nft-contract
  const cryptoDevsNFTContract = CRYPTO_DEVS_NFT_CONTRACT_ADDRESS;
  // fetch ur solidity file
  const cryptoDevsTokenContract = await ethers.getContractFactory(
    "CryptoDevToken"
  );
  // deploy this solidity file(dont forget to pas the constructor arguments)
  const deployedCryptoDevsTokenContract = await cryptoDevsTokenContract.deploy(
    cryptoDevsNFTContract
  );
  // wait for the contract to deploy
  await deployedCryptoDevsTokenContract.deployed();
  // print the address of ur contract
  console.log(
    "Crypto devs token address: ",
    deployedCryptoDevsTokenContract.address
  );
}

// call the main fxn
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
