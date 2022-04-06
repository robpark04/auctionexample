const { task } = require("hardhat/config");
const {
  BASETOKEN_CONTRACT_ADDRESS,
  MINTER_CONTRACT_ADDRESS,
  NOUNS_AUCTION_CONTRACT_ADDRESS,
  name,
  symbol,
  payees,
  shares,
  WETH_CONTRACT_ADDRESS,
  timeBuffer,
  reservePrice,
  minBidIncrementPercentage,
  duration,
} = require("./config");

task("verify-token", "Verifies Token Contract").setAction(async (args, hre) => {
  await run("verify:verify", {
    address: BASETOKEN_CONTRACT_ADDRESS,
    constructorArguments: [name, symbol],
    contract: "contracts/KLOUD.sol:KLOUD",
  });
});

task("verify-minter", "Verifies minter Contract").setAction(
  async (args, hre) => {
    await run("verify:verify", {
      address: MINTER_CONTRACT_ADDRESS,
      constructorArguments: [BASETOKEN_CONTRACT_ADDRESS, payees, shares],
      contract: "contracts/Minter.sol:Minter",
    });
  }
);

task("verify-auction", "Verifies auction Contract").setAction(
  async (args, hre) => {
    await run("verify:verify", {
      address: NOUNS_AUCTION_CONTRACT_ADDRESS,
      constructorArguments: [
        BASETOKEN_CONTRACT_ADDRESS,
        WETH_CONTRACT_ADDRESS,
        timeBuffer,
        reservePrice,
        minBidIncrementPercentage,
        duration,
      ],
      contract: "contracts/NounsAuctionHouse.sol:NounsAuctionHouse",
    });
  }
);
