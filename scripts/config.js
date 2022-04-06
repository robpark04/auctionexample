const { ethers } = require("ethers");
const payees = ["0xFf3BAF49DB5b8bBb853dAf2865D28cbfC6104bbd"];
const shares = [1000000];

module.exports = {
  BASETOKEN_CONTRACT_ADDRESS: "0x65c714763F062f0b6EE0B5b4fBEa76bF0014510D",
  MINTER_CONTRACT_ADDRESS: "0x13fA82a6eC62909AC1a637612A8FA5d23B6B9b62",
  NOUNS_AUCTION_CONTRACT_ADDRESS: "0x61B68A872eAB398EBdCeed55425A3b3B70ba133E",

  name: "WE_ARE_KLOUD",
  symbol: "KLOUD",

  payees: payees,
  shares: shares,

  WETH_CONTRACT_ADDRESS: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
  timeBuffer: 600,
  reservePrice: ethers.utils.parseEther("2"),
  minBidIncrementPercentage: 5,
  duration: 86400,

  minterSigner: "0xFf3BAF49DB5b8bBb853dAf2865D28cbfC6104bbd",
};
