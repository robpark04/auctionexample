const { expect } = require("chai");

const name = "Test Token";
const symbol = "TT";
const maxSupply = 50;

describe("BaseToken", function () {
  let minter;
  let noPermission;

  let baseTokenInstance;

  before(async function () {
    [minter, noPermission] = await ethers.getSigners();

    const KLOUD = await ethers.getContractFactory("KLOUD");
    baseTokenInstance = await KLOUD.deploy(name, symbol);
    await baseTokenInstance.deployed();

    await baseTokenInstance.setMaxSupply(maxSupply);
    await baseTokenInstance.grantRole(
      await baseTokenInstance.MINTER_ROLE(),
      minter.address
    );
  });

  it("should fail to mint tokens if not minter", async function () {
    await expect(
      baseTokenInstance.connect(noPermission).mint(noPermission.address)
    ).to.be.revertedWith("BaseToken: must have minter role to mint");
  });

  it("should permit minter to mint tokens", async function () {
    await baseTokenInstance.connect(minter).mint(noPermission.address);
    expect(await baseTokenInstance.ownerOf(1)).to.be.eq(noPermission.address);

    expect(await baseTokenInstance.balanceOf(noPermission.address)).to.be.eq(1);
    expect(await baseTokenInstance.totalSupply()).to.be.eq(1);
  });

  it("should permit minter to mint up to maxSupply", async function () {
    for (let index = 0; index < maxSupply - 1; index++) {
      await baseTokenInstance.connect(minter).mint(noPermission.address);
      expect(await baseTokenInstance.ownerOf(2 + index)).to.be.eq(
        noPermission.address
      );
    }

    expect(await baseTokenInstance.balanceOf(noPermission.address)).to.be.eq(
      maxSupply
    );
    expect(await baseTokenInstance.totalSupply()).to.be.eq(maxSupply);
  });

  it("should fail to mint more than maxSupply", async function () {
    await expect(
      baseTokenInstance.connect(minter).mint(noPermission.address)
    ).to.be.revertedWith("BaseToken: maxSupply exceeded");
  });

  it("should update baseUri", async function () {
    this.timeout(500000);
    const baseUri = "someEndpoint/";
    await baseTokenInstance.setBaseURI(baseUri);

    for (let i = 1; i <= maxSupply; i++) {
      expect(await baseTokenInstance.tokenURI(i)).to.be.eq(baseUri + i);
    }

    await expect(baseTokenInstance.tokenURI(maxSupply + 1)).to.be.revertedWith(
      "ERC721Metadata: URI query for nonexistent token"
    );
  });

  it("should update tokenUri", async function () {
    const baseUri = "someEndpoint/";
    const uniqueUri = "someNewEndpoint/1";
    await baseTokenInstance.setTokenURI(1, uniqueUri);

    expect(await baseTokenInstance.tokenURI(1)).to.be.eq(uniqueUri);
    for (let i = 2; i <= maxSupply; i++) {
      expect(await baseTokenInstance.tokenURI(i)).to.be.eq(baseUri + i);
    }
    await expect(baseTokenInstance.tokenURI(maxSupply + 1)).to.be.revertedWith(
      "ERC721Metadata: URI query for nonexistent token"
    );
  });

  it("should fail to update token uris if not owner", async function () {
    await expect(
      baseTokenInstance.connect(noPermission).setTokenURI(1, "new thing")
    ).to.be.revertedWith("onlyAdmin: caller is not the admin");
    await expect(
      baseTokenInstance.connect(noPermission).setBaseURI("new thing")
    ).to.be.revertedWith("onlyAdmin: caller is not the admin");
  });
});
