async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", deployer.address);

  const KLOUD = await ethers.getContractFactory("KLOUD");
  /* 
    @construct params       mainnet         rinkeby

    string memory name      WE_ARE_KLOUD    WE_ARE_KLOUD                                       
    string memory symbol    KLOUD           KLOUD
  */
  const kloud = await KLOUD.deploy("WE_ARE_KLOUD", "KLOUD");
  await kloud.deployed();

  console.log("KLOUD is deployed to address: ", kloud.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  });
