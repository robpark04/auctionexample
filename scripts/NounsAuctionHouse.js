async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", deployer.address);

  const NounsAuctionHouse = await ethers.getContractFactory(
    "NounsAuctionHouse"
  );
  /* 
    @construct params                   mainnet                                       rinkeby

    address _nouns(KLOUD address)       0xb8da418ffc2cb675b8b3d73dca0e3f10811fbbdd    0xe607385Ad1391438EAE710481893AD4a3d95394f
    address _weth                       0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2    0xc778417E063141139Fce010982780140Aa0cD5Ab
    uint256 _timeBuffer                 600
    uint256 _reservePrice               2000000000000000000
    uint8 _minBidIncrementPercentage,   5
    uint256 _duration                   86400
  */
  const nounsAuctionHouse = await NounsAuctionHouse.deploy(
    "0xe607385Ad1391438EAE710481893AD4a3d95394f",
    "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    600,
    "2000000000000000000",
    5,
    86400
  );
  await nounsAuctionHouse.deployed();

  console.log(
    "NounsAuctionHouse is deployed to address: ",
    nounsAuctionHouse.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  });
