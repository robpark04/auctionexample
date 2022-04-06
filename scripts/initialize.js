const { task } = require("hardhat/config");
const {
  BASETOKEN_CONTRACT_ADDRESS,
  MINTER_CONTRACT_ADDRESS,
  NOUNS_AUCTION_CONTRACT_ADDRESS,
  minterSigner,
} = require("./config");

task("set-price", "Sets Price for Minter Contract")
  .addParam("etherprice", "Price in ether")
  .setAction(async (args, hre) => {
    const minter = await ethers.getContractAt(
      "Minter",
      MINTER_CONTRACT_ADDRESS
    );
    await minter.setPrice(ethers.utils.parseEther(args.etherprice));
  });

task("grant-minter-role", "Sets minter as MINTER_ROLE for token").setAction(
  async (args, hre) => {
    const kloud = await ethers.getContractAt(
      "KLOUD",
      BASETOKEN_CONTRACT_ADDRESS
    );
    await kloud.grantRole(await kloud.MINTER_ROLE(), MINTER_CONTRACT_ADDRESS);
  }
);

task("set-max-supply", "Sets maxSupply on token")
  .addParam("maxsupply", "Sets token maxSupply")
  .setAction(async (args, hre) => {
    const instance = await ethers.getContractAt(
      "KLOUD",
      BASETOKEN_CONTRACT_ADDRESS
    );
    await instance.setMaxSupply(args.maxsupply);
  });

task("reserve-one", "Reserved 1 token for auction").setAction(
  async (args, hre) => {
    const minter = await ethers.getContractAt(
      "Minter",
      MINTER_CONTRACT_ADDRESS
    );
    await minter.reserveTokens(1);
  }
);

task("send-to-auction", "Sends token to auction contract")
  .addParam("tokenid", "Token id to transfer")
  .setAction(async (args, hre) => {
    const [deployer] = await ethers.getSigners();
    const token = await ethers.getContractAt(
      "KLOUD",
      BASETOKEN_CONTRACT_ADDRESS
    );
    await token.transferFrom(
      deployer.address,
      NOUNS_AUCTION_CONTRACT_ADDRESS,
      args.tokenid
    );
  });

task("create-auction", "Starts auction")
  .addParam("tokenid", "Token id to sell")
  .setAction(async (args, hre) => {
    const auction = await ethers.getContractAt(
      "NounsAuctionHouse",
      NOUNS_AUCTION_CONTRACT_ADDRESS
    );
    await auction.createAuction(args.tokenid);
  });

task("settle-auction", "Settles auction").setAction(async (args, hre) => {
  const auction = await ethers.getContractAt(
    "NounsAuctionHouse",
    NOUNS_AUCTION_CONTRACT_ADDRESS
  );
  await auction.settleAuction();
});

task("start-mint", "Starts the mint sale").setAction(async (args, hre) => {
  const minter = await ethers.getContractAt("Minter", MINTER_CONTRACT_ADDRESS);
  await minter.flipSaleState();
});

task("start-signed-mint", "Starts the whitelist signed mint sale").setAction(
  async (args, hre) => {
    const minter = await ethers.getContractAt(
      "Minter",
      MINTER_CONTRACT_ADDRESS
    );
    await minter.flipSignedMintState();
  }
);

task("set-max-per-block", "Max purchase per address per block")
  .addParam("max", "Sets maxBlockPurchase")
  .setAction(async (args, hre) => {
    const minter = await ethers.getContractAt(
      "Minter",
      MINTER_CONTRACT_ADDRESS
    );
    await minter.setMaxBlockPurchase(args.max);
  });

task("set-max-per-wallet", "Max purchase per address per wallet")
  .addParam("max", "Sets maxWalletPurchase")
  .setAction(async (args, hre) => {
    const minter = await ethers.getContractAt(
      "Minter",
      MINTER_CONTRACT_ADDRESS
    );
    await minter.setMaxWalletPurchase(args.max);
  });

task(
  "set-minter-signer",
  "Sets the address who approves whitelist participants"
).setAction(async (args, hre) => {
  const minter = await ethers.getContractAt("Minter", MINTER_CONTRACT_ADDRESS);
  await minter.setMintSigner(minterSigner);
});
