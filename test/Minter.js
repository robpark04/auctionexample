const { expect } = require("chai");
const { ethers } = require("hardhat");

// import {
//   BaseToken,
//   BaseToken__factory,
//   Minter,
//   Minter__factory,
//   MintTwiceInBlock,
//   MintTwiceInBlock__factory,
// } from "../dist/types/index";
const { v4: uuidv4 } = require("uuid");

describe("Minter", function () {
  let deployer;
  let minter;
  let noPermission;
  let addedPermission;
  let minterAdmin;
  let mintSigner;
  let payee0;
  let payee1;

  let baseTokenInstance;
  let minterInstance;

  const signMintSignOff = async (contract, signer, minter, maxPermitted) => {
    const nonce = ethers.utils.id(uuidv4());
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint256", "bytes32"],
        [contract, minter, maxPermitted, nonce]
      )
    );
    const signature = await signer.signMessage(ethers.utils.arrayify(hash));
    return { signature, nonce };
  };

  const name = "Test Token";
  const symbol = "TT";
  const maxSupply = 50;
  const price = ethers.utils.parseEther("0.001");
  let maxWalletPurchase = 0;
  let maxBlockPurchase = 0;
  const shares = [1, 4];

  beforeEach(async function () {
    [
      deployer,
      minter,
      noPermission,
      addedPermission,
      minterAdmin,
      mintSigner,
      payee0,
      payee1,
    ] = await ethers.getSigners();

    const KLOUD = await ethers.getContractFactory("KLOUD");
    baseTokenInstance = await KLOUD.deploy(name, symbol);
    await baseTokenInstance.deployed();

    const Minter = await ethers.getContractFactory("Minter");
    minterInstance = await Minter.deploy(
      baseTokenInstance.address,
      [payee0.address, payee1.address],
      shares
    );
    await minterInstance.deployed();

    await minterInstance.grantRole(
      await minterInstance.ADMIN_ROLE(),
      minterAdmin.address
    );
    await baseTokenInstance.grantRole(
      await baseTokenInstance.MINTER_ROLE(),
      minterInstance.address
    );
    await baseTokenInstance.setMaxSupply(maxSupply);
  });

  describe("Constructor", async function () {
    it("should record correct token", async function () {
      expect(await minterInstance.tokenContract()).to.be.equal(
        baseTokenInstance.address
      );
    });

    it("should record correct payees", async function () {
      expect(await minterInstance.payee(0)).to.be.equal(payee0.address);
      expect(await minterInstance.payee(1)).to.be.equal(payee1.address);
    });

    it("should record correct shares", async function () {
      expect(
        await minterInstance.shares(await minterInstance.payee(0))
      ).to.be.equal(shares[0]);
      expect(
        await minterInstance.shares(await minterInstance.payee(1))
      ).to.be.equal(shares[1]);
    });

    it("should set deployer as default admin", async function () {
      expect(
        await minterInstance.hasRole(
          await minterInstance.ADMIN_ROLE(),
          minterAdmin.address
        )
      ).to.be.true;
    });

    describe("adminOnly Setters", () => {
      it("should fail if called by non admin");
      it("should log price updated event");
      it("should set new price");
      it("should set maxWalletPurchase");
      it("should set maxBlockPurchase");
      it("should set provenance");
      it("should set reveal time");
      it("should set minterSigner");
      it("should fail to set provenance twice");
      it("should flip signed mint state");
      it("should flip mint state");
    });

    it("should emit mint event");

    describe("signedMint", function () {
      beforeEach(async function () {
        expect(await minterInstance.signedMintIsActive()).to.be.false;
      });

      it("should fail if signedMint is not active", async function () {
        await expect(
          minterInstance.signedMint(1, 1, "0x00", ethers.utils.id("anything"))
        ).to.be.revertedWith("Minter: signedMint is not active");
      });

      describe("when status is active", function () {
        beforeEach(async function () {
          await minterInstance.connect(minterAdmin).flipSignedMintState();
          expect(await minterInstance.signedMintIsActive()).to.be.true;
        });

        it("should fail if number of tokens exceeds permitted max", async function () {
          await expect(
            minterInstance.signedMint(4, 1, "0x00", ethers.utils.id("anything"))
          ).to.be.revertedWith("Minter: numberOfTokens exceeds maxPermitted");
        });

        it("should fail if signature not match");

        describe("when valid signature", function () {
          beforeEach(async function () {
            await minterInstance
              .connect(minterAdmin)
              .setMintSigner(mintSigner.address);
            expect(await minterInstance.mintSigner()).to.be.equal(
              mintSigner.address
            );
          });

          it("should fail if nonce already used");

          it("should fail if number of tokens is 0", async function () {
            const maxPermitted = 1;
            const { signature, nonce } = await signMintSignOff(
              minterInstance.address,
              mintSigner,
              minter.address,
              maxPermitted
            );

            await expect(
              minterInstance
                .connect(minter)
                .signedMint(0, maxPermitted, signature, nonce)
            ).to.be.revertedWith("Minter: numberOfTokens is 0");
          });

          it("should fail if price is set to 0", async function () {
            await minterInstance.connect(minterAdmin).setPrice(0);
            const maxPermitted = 1;
            const { signature, nonce } = await signMintSignOff(
              minterInstance.address,
              mintSigner,
              minter.address,
              maxPermitted
            );
            await expect(
              minterInstance
                .connect(minter)
                .signedMint(1, maxPermitted, signature, nonce)
            ).to.be.revertedWith("Minter: price not set");
          });

          describe("when price set", function () {
            beforeEach(async function () {
              await minterInstance.connect(minterAdmin).setPrice(price);
            });

            it("should fail if not enough ether sent", async function () {
              const maxPermitted = 1;
              const { signature, nonce } = await signMintSignOff(
                minterInstance.address,
                mintSigner,
                minter.address,
                maxPermitted
              );
              await expect(
                minterInstance
                  .connect(minter)
                  .signedMint(1, maxPermitted, signature, nonce)
              ).to.be.revertedWith("Minter: Sent ether value is incorrect");
            });

            it("should refund if too much ether sent", async function () {
              const preBalance = await ethers.provider.getBalance(
                minter.address
              );
              const { signature, nonce } = await signMintSignOff(
                minterInstance.address,
                mintSigner,
                minter.address,
                5
              );
              const res = await minterInstance
                .connect(minter)
                .signedMint(5, 5, signature, nonce, {
                  value: ethers.utils.parseEther("1"),
                });
              const receipt = await res.wait();
              const gasFee = receipt.cumulativeGasUsed.mul(
                receipt.effectiveGasPrice
              );

              const postBalance = await ethers.provider.getBalance(
                minter.address
              );

              expect(preBalance.sub(postBalance).sub(gasFee)).to.be.equal(
                ethers.BigNumber.from(price).mul(5)
              );
            });

            it("should fail if numberOfTokens surpasses maxSupply", async function () {
              const numberToMint = maxSupply + 1;
              const { signature, nonce } = await signMintSignOff(
                minterInstance.address,
                mintSigner,
                minter.address,
                numberToMint
              );
              await expect(
                minterInstance
                  .connect(minter)
                  .signedMint(numberToMint, numberToMint, signature, nonce, {
                    value: ethers.BigNumber.from(price).mul(numberToMint),
                  })
              ).to.be.revertedWith("Minter: Purchase would exceed max supply");
            });

            it("should mint to minter", async function () {
              const numberToMint = maxSupply;
              const totalCost = ethers.BigNumber.from(price).mul(numberToMint);
              const { signature, nonce } = await signMintSignOff(
                minterInstance.address,
                mintSigner,
                minter.address,
                numberToMint
              );
              await minterInstance
                .connect(minter)
                .signedMint(numberToMint, numberToMint, signature, nonce, {
                  value: totalCost,
                });

              expect(
                await ethers.provider.getBalance(minterInstance.address)
              ).to.be.equal(totalCost);

              expect(
                await baseTokenInstance.balanceOf(minter.address)
              ).to.be.equal(numberToMint);
              expect(await baseTokenInstance.totalMinted()).to.be.equal(
                numberToMint
              );
              expect(await baseTokenInstance.totalSupply()).to.be.equal(
                numberToMint
              );
            });

            describe("maxPurchaseBehavior", function () {
              const maxPerBlock = 10;
              const maxPerWallet = 20;

              beforeEach(async function () {
                await minterInstance
                  .connect(minterAdmin)
                  .setMaxBlockPurchase(maxPerBlock);
                await minterInstance
                  .connect(minterAdmin)
                  .setMaxWalletPurchase(maxPerWallet);
              });

              it("should fail if mint too many in a block", async function () {
                const numberToMint = 11;
                const totalCost =
                  ethers.BigNumber.from(price).mul(numberToMint);
                const { signature, nonce } = await signMintSignOff(
                  minterInstance.address,
                  mintSigner,
                  minter.address,
                  numberToMint
                );
                await expect(
                  minterInstance
                    .connect(minter)
                    .signedMint(numberToMint, numberToMint, signature, nonce, {
                      value: totalCost,
                    })
                ).to.be.revertedWith("Minter: maxBlockPurchase exceeded");
              });

              it("should fail if mint two times in a block");

              it("should fail if mint too many per wallet", async function () {
                const numberToMint = 10;
                const totalCost =
                  ethers.BigNumber.from(price).mul(numberToMint);
                let res = await signMintSignOff(
                  minterInstance.address,
                  mintSigner,
                  minter.address,
                  numberToMint
                );
                await (
                  await minterInstance
                    .connect(minter)
                    .signedMint(
                      numberToMint,
                      numberToMint,
                      res.signature,
                      res.nonce,
                      { value: totalCost }
                    )
                ).wait();
                res = await signMintSignOff(
                  minterInstance.address,
                  mintSigner,
                  minter.address,
                  numberToMint
                );
                await (
                  await minterInstance
                    .connect(minter)
                    .signedMint(
                      numberToMint,
                      numberToMint,
                      res.signature,
                      res.nonce,
                      { value: totalCost }
                    )
                ).wait();

                res = await signMintSignOff(
                  minterInstance.address,
                  mintSigner,
                  minter.address,
                  numberToMint
                );
                await expect(
                  minterInstance
                    .connect(minter)
                    .signedMint(1, numberToMint, res.signature, res.nonce, {
                      value: totalCost,
                    })
                ).to.be.revertedWith("Minter: Sender reached mint max");
              });

              it("should permit up to block minting limit", async function () {
                const numberToMint = 10;
                const totalCost =
                  ethers.BigNumber.from(price).mul(numberToMint);
                const res = await signMintSignOff(
                  minterInstance.address,
                  mintSigner,
                  minter.address,
                  numberToMint
                );
                await (
                  await minterInstance
                    .connect(minter)
                    .signedMint(
                      numberToMint,
                      numberToMint,
                      res.signature,
                      res.nonce,
                      { value: totalCost }
                    )
                ).wait();

                expect(
                  await baseTokenInstance.balanceOf(minter.address)
                ).to.be.equal(numberToMint);
              });

              it("should permit up to wallet minting limit", async function () {
                const numberToMint = 10;
                const totalCost =
                  ethers.BigNumber.from(price).mul(numberToMint);
                let res = await signMintSignOff(
                  minterInstance.address,
                  mintSigner,
                  minter.address,
                  numberToMint
                );
                await (
                  await minterInstance
                    .connect(minter)
                    .signedMint(
                      numberToMint,
                      numberToMint,
                      res.signature,
                      res.nonce,
                      { value: totalCost }
                    )
                ).wait();
                res = await signMintSignOff(
                  minterInstance.address,
                  mintSigner,
                  minter.address,
                  numberToMint
                );
                await (
                  await minterInstance
                    .connect(minter)
                    .signedMint(
                      numberToMint,
                      numberToMint,
                      res.signature,
                      res.nonce,
                      { value: totalCost }
                    )
                ).wait();

                expect(
                  await baseTokenInstance.balanceOf(minter.address)
                ).to.be.equal(numberToMint + numberToMint);
              });
            });
          });
        });
      });
    });

    describe("mint", function () {
      it("should fail if sale is not active", async function () {
        await expect(minterInstance.mint(1)).to.be.revertedWith(
          "Minter: Sale is not active"
        );
      });

      describe("when status is active", function () {
        beforeEach(async function () {
          await minterInstance.connect(minterAdmin).flipSaleState();
          expect(await minterInstance.saleIsActive()).to.be.true;
        });

        it("should fail if number of tokens is 0", async function () {
          await expect(minterInstance.mint(0)).to.be.revertedWith(
            "Minter: numberOfTokens is 0"
          );
        });

        it("should fail if price is set to 0", async function () {
          await minterInstance.connect(minterAdmin).setPrice(0);

          await expect(minterInstance.mint(1)).to.be.revertedWith(
            "Minter: price not set"
          );
        });

        describe("when price set", function () {
          beforeEach(async function () {
            await minterInstance.connect(minterAdmin).setPrice(price);
          });

          it("should fail if not enough ether sent", async function () {
            await expect(minterInstance.mint(1)).to.be.revertedWith(
              "Minter: Sent ether value is incorrect"
            );
          });

          it("should refund if too much ether sent", async function () {
            const preBalance = await ethers.provider.getBalance(
              deployer.address
            );
            const res = await minterInstance.mint(5, {
              value: ethers.utils.parseEther("1"),
            });
            const receipt = await res.wait();
            const gasFee = receipt.cumulativeGasUsed.mul(
              receipt.effectiveGasPrice
            );

            const postBalance = await ethers.provider.getBalance(
              deployer.address
            );

            expect(preBalance.sub(postBalance).sub(gasFee)).to.be.equal(
              ethers.BigNumber.from(price).mul(5)
            );
          });

          it("should fail if numberOfTokens surpasses maxSupply", async function () {
            const numberToMint = maxSupply + 1;
            await expect(
              minterInstance.mint(numberToMint, {
                value: ethers.BigNumber.from(price).mul(numberToMint),
              })
            ).to.be.revertedWith("Minter: Purchase would exceed max supply");
          });

          it("should mint to minter", async function () {
            const numberToMint = maxSupply;
            const totalCost = ethers.BigNumber.from(price).mul(numberToMint);
            await minterInstance.mint(numberToMint, { value: totalCost });

            expect(
              await ethers.provider.getBalance(minterInstance.address)
            ).to.be.equal(totalCost);

            expect(
              await baseTokenInstance.balanceOf(deployer.address)
            ).to.be.equal(numberToMint);
            expect(await baseTokenInstance.totalMinted()).to.be.equal(
              numberToMint
            );
            expect(await baseTokenInstance.totalSupply()).to.be.equal(
              numberToMint
            );
          });

          describe("maxPurchaseBehavior", function () {
            const maxPerBlock = 10;
            const maxPerWallet = 20;

            beforeEach(async function () {
              await minterInstance
                .connect(minterAdmin)
                .setMaxBlockPurchase(maxPerBlock);
              await minterInstance
                .connect(minterAdmin)
                .setMaxWalletPurchase(maxPerWallet);
            });

            it("should fail if mint too many in a block", async function () {
              const numberToMint = 11;
              const totalCost = ethers.BigNumber.from(price).mul(numberToMint);
              await expect(
                minterInstance.mint(numberToMint, { value: totalCost })
              ).to.be.revertedWith("Minter: maxBlockPurchase exceeded");
            });

            it("should fail if mint two times in a block", async function () {
              const MintTwiceInBlock = await ethers.getContractFactory(
                "MintTwiceInBlock"
              );
              const mintTwiceInstance = await MintTwiceInBlock.deploy();
              await mintTwiceInstance.deployed();

              const numberToMint = 2;
              const totalCost = ethers.BigNumber.from(price).mul(numberToMint);

              await expect(
                mintTwiceInstance.mintTwoTimes(
                  minterInstance.address,
                  totalCost,
                  numberToMint,
                  { value: totalCost.add(totalCost) }
                )
              ).to.be.revertedWith("Minter: Sender already minted this block");
            });

            it("should fail if mint too many per wallet", async function () {
              const numberToMint = 10;
              const totalCost = ethers.BigNumber.from(price).mul(numberToMint);
              await (
                await minterInstance.mint(numberToMint, { value: totalCost })
              ).wait();
              await (
                await minterInstance.mint(numberToMint, { value: totalCost })
              ).wait();

              await expect(
                minterInstance.mint(1, { value: price })
              ).to.be.revertedWith("Minter: Sender reached mint max");
            });

            it("should permit up to block minting limit", async function () {
              const numberToMint = 10;
              const totalCost = ethers.BigNumber.from(price).mul(numberToMint);
              await (
                await minterInstance.mint(numberToMint, { value: totalCost })
              ).wait();

              expect(
                await baseTokenInstance.balanceOf(deployer.address)
              ).to.be.equal(numberToMint);
            });

            it("should permit up to wallet minting limit", async function () {
              const numberToMint = 10;
              const totalCost = ethers.BigNumber.from(price).mul(numberToMint);
              await (
                await minterInstance.mint(numberToMint, { value: totalCost })
              ).wait();
              await (
                await minterInstance.mint(numberToMint, { value: totalCost })
              ).wait();

              expect(
                await baseTokenInstance.balanceOf(deployer.address)
              ).to.be.equal(numberToMint + numberToMint);
            });
          });
        });
      });
    });

    describe("reserveTokens", function () {
      it("should fail if called by non admin", async function () {
        await expect(
          minterInstance.connect(noPermission).reserveTokens(10)
        ).to.be.revertedWith("onlyAdmin: caller is not the admin");
      });

      it("should mint tokens to admin", async function () {
        await minterInstance.connect(minterAdmin).reserveTokens(10);
        expect(await baseTokenInstance.totalMinted()).to.be.equal(10);
        expect(
          await baseTokenInstance.balanceOf(minterAdmin.address)
        ).to.be.equal(10);
      });
    });

    // describe("BaseToken", function() {

    //   it("should fail to mint tokens if not minter", async function () {
    //     await expect(baseTokenInstance.connect(noPermission).mint(noPermission.address))
    //       .to.be.revertedWith("BaseToken: must have minter role to mint");
    //   });

    //   describe("set minter", function() {
    //     beforeEach(async function() {
    //       await baseTokenInstance.grantRole(await baseTokenInstance.MINTER_ROLE(), minter.address);
    //     });

    //     it("should permit minter to mint tokens", async function () {
    //       await baseTokenInstance.connect(minter).mint(noPermission.address);
    //       expect(await baseTokenInstance.ownerOf(1)).to.be.eq(noPermission.address);

    //       expect(await baseTokenInstance.balanceOf(noPermission.address)).to.be.eq(1);
    //       expect(await baseTokenInstance.totalSupply()).to.be.eq(1);
    //     });

    //     it("should permit minter to mint up to maxSupply", async function () {

    //       for (let index = 0; index < (maxSupply as number); index++) {
    //         await baseTokenInstance.connect(minter).mint(noPermission.address);
    //         expect(await baseTokenInstance.ownerOf(1+index)).to.be.eq(noPermission.address);
    //       }

    //       expect(await baseTokenInstance.balanceOf(noPermission.address)).to.be.eq(maxSupply);
    //       expect(await baseTokenInstance.totalSupply()).to.be.eq(maxSupply);
    //     });

    //     it("should fail to mint more than maxSupply", async function () {
    //       for (let index = 0; index < (maxSupply as number + 1); index++) {
    //         if (index == maxSupply) {
    //           await expect(baseTokenInstance.connect(minter).mint(noPermission.address))
    //             .to.be.revertedWith("BaseToken: maxSupply exceeded");

    //         } else {
    //           await baseTokenInstance.connect(minter).mint(noPermission.address);
    //           expect(await baseTokenInstance.ownerOf(1+index)).to.be.eq(noPermission.address);
    //         }
    //       }

    //       expect(await baseTokenInstance.balanceOf(noPermission.address)).to.be.eq(maxSupply);
    //       expect(await baseTokenInstance.totalSupply()).to.be.eq(maxSupply);
    //     });

    //     it("should update baseUri", async function() {
    //       this.timeout(500000);

    //       for (let index = 0; index < (maxSupply as number); index++) {
    //         await baseTokenInstance.connect(minter).mint(noPermission.address);
    //         expect(await baseTokenInstance.ownerOf(1+index)).to.be.eq(noPermission.address);
    //       }

    //       const baseUri = "someEndpoint/";
    //       await baseTokenInstance.setBaseURI(baseUri);

    //       for (let i = 1; i <= maxSupply; i++) {
    //         expect(await baseTokenInstance.tokenURI(i)).to.be.eq(baseUri + i);
    //       }

    //       await expect(baseTokenInstance.tokenURI(maxSupply as number + 1)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    //     });

    //     it("should update tokenUri", async function () {

    //       for (let index = 0; index < (maxSupply as number); index++) {
    //         await baseTokenInstance.connect(minter).mint(noPermission.address);
    //         expect(await baseTokenInstance.ownerOf(1+index)).to.be.eq(noPermission.address);
    //       }

    //       const baseUri = "someEndpoint/";
    //       const uniqueUri = "someNewEndpoint/1";
    //       await baseTokenInstance.setBaseURI(baseUri);
    //       await baseTokenInstance.setTokenURI(1, uniqueUri);

    //       expect(await baseTokenInstance.tokenURI(1)).to.be.eq(uniqueUri);

    //       for (let i = 2; i <= maxSupply; i++) {
    //         expect(await baseTokenInstance.tokenURI(i)).to.be.eq(baseUri + i);
    //       }
    //       await expect(baseTokenInstance.tokenURI(maxSupply as number + 1)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    //     });

    //     it("should fail to update token uris if not owner", async function () {
    //       await baseTokenInstance.connect(minter).mint(noPermission.address);
    //       expect(await baseTokenInstance.ownerOf(1)).to.be.eq(noPermission.address);

    //       await expect(baseTokenInstance.connect(noPermission).setTokenURI(1, "new thing"))
    //         .to.be.revertedWith("onlyAdmin: caller is not the admin");
    //       await expect(baseTokenInstance.connect(noPermission).setBaseURI("new thing"))
    //         .to.be.revertedWith("onlyAdmin: caller is not the admin");
    //     });
    //   });

    // });

    // describe("Update Project Info", function() {

    //   let newProjectInfo: ProjectStruct;

    //   beforeEach(async function() {
    //     newProjectInfo = {
    //       name: "newness",
    //       symbol: "NEW",
    //       artist: "Hijacksy",
    //       description: "This project is ballerer",
    //       website: "www.yeeterer.com",
    //       license: "idk",
    //       maxSupply: 500,
    //       price: ethers.utils.parseEther("0.51"),
    //       minter.address,
    //       maxWalletPurchase: 5,
    //       maxBlockPurchase: 5,
    //       status: 2
    //     };
    //   });

    //   it("should fail if not called by admin or owner", async function() {
    //     await expect(registryInstance.connect(noPermission).updateProjectInfo(baseTokenInstance.address, project))
    //       .to.be.revertedWith("onlyRegistryAdminOrProjectAdmin: caller is not the Registry or Project or admin");
    //   });

    //   it("should update all info if called by admin or owner", async function() {
    //     await registryInstance.updateProjectInfo(baseTokenInstance.address, newProjectInfo);

    //     const revProject = await registryInstance.getProject(baseTokenInstance.address);

    //     expect(revname).to.be.equal(newProjectInfo.name);
    //     expect(revsymbol).to.be.equal(newProjectInfo.symbol);
    //     expect(revartist).to.be.equal(newProjectInfo.artist);
    //     expect(revdescription).to.be.equal(newProjectInfo.description);
    //     expect(revwebsite).to.be.equal(newProjectInfo.website);
    //     expect(revlicense).to.be.equal(newProjectInfo.license);
    //     expect(revprice).to.be.equal(newProjectInfo.price);
    //     expect(revminter).to.be.equal(newProjectInfo.minter);
    //     expect(revmaxBlockPurchase).to.be.equal(newProjectInfo.maxBlockPurchase);
    //     expect(revmaxWalletPurchase).to.be.equal(newProjectInfo.maxWalletPurchase);
    //     expect(revstatus).to.be.equal(newProjectInfo.status);
    //   });

    //   it("should update price if called by admin or owner", async function() {
    //     await registryInstance.updateProjectPrice(baseTokenInstance.address, newProjectInfo.price);
    //     expect(await registryInstance.getProjectPrice(baseTokenInstance.address))
    //       .to.be.equal(newProjectInfo.price);
    //   });

    //   it("should update status if called by admin or owner", async function() {
    //     await registryInstance.updateProjectStatus(baseTokenInstance.address, newProjectInfo.status);
    //     expect(await registryInstance.getProjectStatus(baseTokenInstance.address))
    //       .to.be.equal(newProjectInfo.status);
    //   });

    //   it("should update maxSupply if called by admin or owner", async function() {
    //     await registryInstance.setMaxSupply(baseTokenInstance.address, newProjectInfo.maxSupply);
    //     expect(await registryInstance.getProjectMaxSupply(baseTokenInstance.address))
    //       .to.be.equal(newProjectInfo.maxSupply);
    //   });

    //   it("should update maxWalletPurchase if called by admin or owner", async function() {
    //     await registryInstance.updateProjectMaxWalletPurchase(baseTokenInstance.address, newProjectInfo.maxWalletPurchase);
    //     expect(await registryInstance.getProjectMaxWalletPurchase(baseTokenInstance.address))
    //       .to.be.equal(newProjectInfo.maxWalletPurchase);
    //   });

    //   it("should update maxBlockPurchase if called by admin or owner", async function() {
    //     await registryInstance.updateProjectMaxBlockPurchase(baseTokenInstance.address, newProjectInfo.maxBlockPurchase);
    //     expect(await registryInstance.getProjectMaxBlockPurchase(baseTokenInstance.address))
    //       .to.be.equal(newProjectInfo.maxBlockPurchase);
    //   });

    //   describe("set minter", function() {
    //     beforeEach(async function() {
    //       await baseTokenInstance.grantRole(await baseTokenInstance.MINTER_ROLE(), minter.address);
    //     });

    //     it("should update baseUri through registry", async function() {
    //       this.timeout(500000);

    //       for (let index = 0; index < (maxSupply as number); index++) {
    //         await baseTokenInstance.connect(minter).mint(noPermission.address);
    //         expect(await baseTokenInstance.ownerOf(1+index)).to.be.eq(noPermission.address);
    //       }

    //       const baseUri = "someEndpointFromRegistry/";
    //       await registryInstance.setBaseURI(baseTokenInstance.address, baseUri);

    //       for (let i = 1; i <= maxSupply; i++) {
    //         expect(await baseTokenInstance.tokenURI(i)).to.be.eq(baseUri + i);
    //       }

    //       await expect(baseTokenInstance.tokenURI(maxSupply as number + 1)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    //     });

    //     it("should update tokenUri through registry", async function () {

    //       for (let index = 0; index < (maxSupply as number); index++) {
    //         await baseTokenInstance.connect(minter).mint(noPermission.address);
    //         expect(await baseTokenInstance.ownerOf(1+index)).to.be.eq(noPermission.address);
    //       }

    //       const baseUri = "someEndpointFromRegistry/";
    //       const uniqueUri = "someNewEndpointThroughRegistry/1";
    //       await registryInstance.setBaseURI(baseTokenInstance.address, baseUri);
    //       await registryInstance.setTokenURI(baseTokenInstance.address, 1, uniqueUri);

    //       expect(await baseTokenInstance.tokenURI(1)).to.be.eq(uniqueUri);

    //       for (let i = 2; i <= maxSupply; i++) {
    //         expect(await baseTokenInstance.tokenURI(i)).to.be.eq(baseUri + i);
    //       }
    //       await expect(baseTokenInstance.tokenURI(maxSupply as number + 1)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    //     });

    //     it("should fail to update token uris if not owner", async function () {
    //       await baseTokenInstance.connect(minter).mint(noPermission.address);
    //       expect(await baseTokenInstance.ownerOf(1)).to.be.eq(noPermission.address);

    //       await expect(registryInstance.connect(noPermission).setTokenURI(baseTokenInstance.address, 1, "new thing"))
    //         .to.be.revertedWith("onlyRegistryAdminOrProjectAdmin: caller is not the Registry or Project or admin");
    //       await expect(registryInstance.connect(noPermission).setBaseURI(baseTokenInstance.address, "new thing"))
    //         .to.be.revertedWith("onlyRegistryAdminOrProjectAdmin: caller is not the Registry or Project or admin");
    //     });

    //   });

    // });

    // describe("Update Project Admin", function() {
    //   it("should fail if not called by admin", async function() {
    //     await expect(
    //       registryInstance.connect(noPermission).addProjectAdmin(baseTokenInstance.address, payee0.address)
    //     ).to.be.revertedWith("onlyDefaultAdmin: caller is not the admin");
    //   });

    //   it("should fail if minter not deployed", async function() {
    //     await expect(
    //       registryInstance.addProjectAdmin(baseTokenInstance.address, payee0.address)
    //     ).to.be.revertedWith("addProjectAdmin: Deploy minter first");
    //   });

    //   describe("When Minter Deployed", function() {

    //     let minterInstance;
    //     const shares0 = 1;
    //     const shares1 = 4;

    //     beforeEach(async function() {
    //       await registryInstance.createMinter(
    //         baseTokenInstance.address,
    //         [payee0.address, payee1.address],
    //         [shares0, shares1]
    //       );

    //       minterInstance = await ethers.getContractAt(
    //         "Minter",
    //         await registryInstance.getProjectMinter(baseTokenInstance.address)
    //       ) as Minter;

    //       await registryInstance.addProjectAdmin(baseTokenInstance.address, addedPermission.address);
    //     });

    //     it("should update project's admin role", async function() {
    //       const projectAdminRole = await registryInstance.getProjectAdminRole(baseTokenInstance.address);
    //       expect(await registryInstance.hasRole(projectAdminRole, addedPermission.address));
    //     });

    //     it("should update tokens's admin role", async function() {
    //       const adminRole = await baseTokenInstance.DEFAULT_ADMIN_ROLE();
    //       expect(await baseTokenInstance.hasRole(adminRole, addedPermission.address));
    //     });

    //     it("should update minter's admin role", async function() {
    //       const adminRole = await minterInstance.ADMIN_ROLE();
    //       expect(await minterInstance.hasRole(adminRole, addedPermission.address));
    //     });

    //   });
    // });
  });
});
