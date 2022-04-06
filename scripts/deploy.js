const { task } = require("hardhat/config");
const {
  name,
  symbol,
  BASETOKEN_CONTRACT_ADDRESS,
  payees,
  shares,
  WETH_CONTRACT_ADDRESS,
  timeBuffer,
  reservePrice,
  minBidIncrementPercentage,
  duration,
} = require("./config");

task("deploy-basetoken", "Deploy BaseToken Contract").setAction(
  async (args, hre) => {
    const KLOUD = await ethers.getContractFactory("KLOUD");
    /* 
    @construct params       mainnet         rinkeby

    string memory name      WE_ARE_KLOUD    WE_ARE_KLOUD                                       
    string memory symbol    KLOUD           KLOUD
    */
    const kloud = await KLOUD.deploy(name, symbol);
    await kloud.deployed();
    console.log("KLOUD(BaseToken) is deployed to address: ", kloud.address);
  }
);

task("deploy-minter", "Deploy Minter Contract").setAction(async (args, hre) => {
  const Minter = await ethers.getContractFactory("Minter");
  /* 
	@construct params                   mainnet                                       rinkeby

	address _tokenContract			0xb8da418ffc2cb675b8b3d73dca0e3f10811fbbdd		0x0729Ce99d58366020D6e65c5f0bbA5032cC9770a
	address[] memory payees,		[
																0x27a19c04Fc5045846Ca9C61da7b9B5dBa153Bb56,
																0x988c894591699856f17a99013F6FEe7625245200,
																0x392678bc9BBcc5F53Db693e557f94a6549CB2692,
																0x1A0E9FB3C0f8dF1b96270Eac55A822bcE202de51,
																0x1c9ff65c105Dc8737E681DD62F0d495c6951002E,
																0x0BF6305D4382C37a7C330604048AE9813DDadE28,
																0x559C4b03a2474b04074c3678d08Fd5B8BaE85028
															]
	uint256[] memory shares_		[
																500000, 
																250000,
																150000,
																62500,
																18750,
																9375,
																9375
															]
  */
  const minter = await Minter.deploy(
    BASETOKEN_CONTRACT_ADDRESS,
    payees,
    shares
  );
  await minter.deployed();

  console.log("Minter is deployed to address: ", minter.address);
});

task("deploy-auction", "Deploy Auction Contract").setAction(
  async (args, hre) => {
    const NounsAuctionHouse = await ethers.getContractFactory(
      "NounsAuctionHouse"
    );
    /* 
    @construct params                   mainnet                                       rinkeby

    address _nouns(dynamic)       			0xb8da418ffc2cb675b8b3d73dca0e3f10811fbbdd    0x85900Bc540fCfd0DC4eD876785d3bA893fF9420D
    address _weth (static)              0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2    0xc778417E063141139Fce010982780140Aa0cD5Ab
    uint256 _timeBuffer                 600
    uint256 _reservePrice               2000000000000000000
    uint8 _minBidIncrementPercentage,   5
    uint256 _duration                   86400
  	*/
    const nounsAuctionHouse = await NounsAuctionHouse.deploy(
      BASETOKEN_CONTRACT_ADDRESS,
      WETH_CONTRACT_ADDRESS,
      timeBuffer,
      reservePrice,
      minBidIncrementPercentage,
      duration
    );
    await nounsAuctionHouse.deployed();

    console.log(
      "NounsAuctionHouse is deployed to address: ",
      nounsAuctionHouse.address
    );
  }
);
