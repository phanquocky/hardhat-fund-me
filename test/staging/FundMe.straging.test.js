const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkDevelopment } = require("../../helper-hardhat-config");
const { assert } = require("chai");

networkDevelopment.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let FundMe;
      let deployer;
      const sendValue = ethers.parseEther("1"); // not enough ether for send :V
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        FundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Allow people fund money", async () => {
        await FundMe.fund({ value: sendValue });
        assert.equal(
          await ethers.provider.getBalance(await FundMe.getAddress())
        );
      });
    });
