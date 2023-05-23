import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { BigNumber, providers, Contract, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants/index";

function Home() {
  // create a bignumber - `0`
  const zero = BigNumber.from(0);
  // check if the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // create a loading screen wherever applicable
  const [loading, setLoading] = useState(false);
  // keep a check on the no of tokens that can be claimed based on the NFT held by the user
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  // keep a count on no of tokens held by an account
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);
  // amount of tokens the user wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);
  // keep a check on how many tokens have been minted so far
  const [tokensMinted, setTokensMinted] = useState(zero);
  // keep a check whether the address is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // create a reference for web3modal
  const web3ModalRef = useRef(null);

  // checks the balance of tokens that can be mined/claimed by the user
  async function getTokensToBeClaimed() {
    try {
      // get the provide from web3modal
      const provider = await getProviderOrSigner();
      // create an instance of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      // create an instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      // we need the address of the currently connected account on metamask, so we need a signer
      const signer = await getProviderOrSigner(true);
      // get the address
      const address = signer.getAddress();
      // we need to get the no of NFTs held by the current address
      const balance = await nftContract.balanceOf(address);
      // The balance is a bignumber so compare accordingly
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        // keep track of unclaimed tokens
        var amount = 0;
        // for all nfts check if the token is already claimed
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // get the no tokens held by an address
  async function getBalanceOfCryptoDevTokens() {
    try {
      // get a provider
      const provider = await getProviderOrSigner();
      // Create an instance of the token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // we need the address so we need a signer
      const signer = await getProviderOrSigner(true);
      // get the address
      const address = signer.getAddress();
      // fetch the balance of tokens of the above obtained address
      const balance = await tokenContract.balanceOf(address);
      // set the state variable accordingly
      setBalanceOfCryptoDevTokens(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfCryptoDevTokens(zero);
    }
  }

  // Mints a Specified amount of tokens to a given address
  async function mintCryptoDevToken(noOfTokens) {
    try {
      // we need a signer here
      const signer = await getProviderOrSigner(true);
      // create an instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      // the value to mint a token
      const value = 0.0001 * noOfTokens;
      // *create a tx(calling a payable fxn) to mint the tokens into the specified address
      const tx = await tokenContract.Mint(noOfTokens, {
        value: utils.parseEther(value.toString()),
      });

      setLoading(true);
      // wait for the transactions to be mined
      await tx.wait();
      setLoading(false);
      window.alert("Successfully minted Crypto Dev Tokens");
      // after everytime a transaction is done u are going to change the state variables
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  }

  // Helps the user to claim Crypto dev tokens via their NFT
  async function claimCryptoDevTokens() {
    try {
      // fetch a signer
      const signer = await getProviderOrSigner(true);
      // create an instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.claim();
      setLoading(true);
      // wait for tx to get deployed
      await tx.wait();
      setLoading(false);
      window.alert("Successfully claimed Crypto Dev Tokens");
      // afer getting the tokens change the state variables
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  }

  // get the total tokens minted until now
  async function getTotalTokensMinted() {
    try {
      // get a provider
      const provider = await getProviderOrSigner();
      // create an instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // get th no of token minted
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (err) {
      console.error(err);
    }
  }

  // Check if the connected address is owner
  async function getOwner() {
    try {
      // get a provider
      const provider = await getProviderOrSigner();
      // create an instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      //* get teh owner of the contract
      const _owner = tokenContract.owner();
      // get a signer
      const signer = await getProviderOrSigner(true);
      // fetch the address who is currently handling the dApp
      const address = await signer.getAddress();

      // now verigy wheter it is indeed the owner
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // withdraw coins from the contract
  async function withdrawCoins() {
    try {
      // fetch a signer
      const signer = await getProviderOrSigner(true);
      // create an instance of the contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.withdraw();
      setLoading(true);
      // wait for the tx to get deployed
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (err) {
      console.error(err);
      window.alert(err.reason);
    }
  }

  // get a provider or signer
  async function getProviderOrSigner(needSigner = true) {
    // connect to metamask
    const provider = await web3ModalRef.current.connect();
    // obtain the web3 provider
    const web3Provider = new providers.Web3Provider(provider);
    // make sure the user is using sepolia testnet
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 11155111) {
      window.alert("Please change the network to Sepolia");
      throw new Error("Change the network to Sepolia");
    }
    // check if signer is needed
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  // prompt to connect the wallet
  async function connectWallet() {
    try {
      // from this u will get a prompt in ur browser(metamask will pop up)
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      // create a new instance of web3modal ref
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
      getOwner();
    }
  }, [walletConnected]);

  // render a button
  function renderButton() {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    // if tokens to be claimed are valid numbers, then display claim
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          {/* WARNING */}
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    // if the users has no tokens to claim show the mint button
    return (
      // An element with an inline sty;e
      <div style={{ display: "flex-col" }}>
        <div>
          {/* Taking input from the user */}
          <input
            type="number"
            placeholder="Number of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>
        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  }

  // Creating the structure the website starts from here
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Convert a bigNumber to a string */}
                You have minted {utils.formatEther(
                  balanceOfCryptoDevTokens
                )}{" "}
                Crypto Dev Tokens!
              </div>
              <div className={styles.description}>
                {/* convert a bignumber to string */}
                Overall {utils.formatEther(tokensMinted)}/1000 have been
                minted!!!
              </div>
              {renderButton()}
              {/* display another button if the address is owner */}
              {isOwner ? (
                <div>
                  {loading ? (
                    <button className={styles.button}>Loading...</button>
                  ) : (
                    <button className={styles.button} onClick={withdrawCoins}>
                      Withdraw Coins
                    </button>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Ash Devs</footer>
    </div>
  );
}

export default Home;
