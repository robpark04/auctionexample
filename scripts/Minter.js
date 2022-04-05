async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", deployer.address);

  const Minter = await ethers.getContractFactory("Minter");
  /* 
      @construct params                   mainnet                                       rinkeby

      address _tokenContract			0xb8da418ffc2cb675b8b3d73dca0e3f10811fbbdd	0xddB569a7cfE054866b508Ca6f41C744F5e567474
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
    "0xddB569a7cfE054866b508Ca6f41C744F5e567474",
    ["0x27a19c04Fc5045846Ca9C61da7b9B5dBa153Bb56"],
    ["500000"]
  );
  await minter.deployed();

  console.log("Minter is deployed to address: ", minter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  });
