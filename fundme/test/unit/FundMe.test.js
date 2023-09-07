const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { assert, expect } = require("chai");
const { networkDevelopment } = require("../../helper-hardhat-config");

!networkDevelopment.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let FundMe;
      let deployer;
      let MockV3Aggregator;
      const sendValue = ethers.parseEther("1"); // 1eth
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        FundMe = await ethers.getContract("FundMe", deployer);
        MockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", () => {
        it("Set the aggregator address correctly", async () => {
          const response = await FundMe.getPriceFeed();
          assert.equal(response, await MockV3Aggregator.getAddress());
        });
      });

      describe("fund", () => {
        it("Fail if don't send enough ETH", async () => {
          expect(FundMe.fund()).to.be.rejectedWith(
            "Fail because don't enough eth"
          );
        });

        it("updated amount ", async () => {
          await FundMe.fund({ value: sendValue });
          const response = await FundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("add to funder array", async () => {
          await FundMe.fund({ value: sendValue });
          const response = await FundMe.getFunder(0);
          assert.equal(response, deployer);
        });
      });

      describe("withdraw", () => {
        beforeEach(async () => {
          await FundMe.fund({ value: sendValue });
        });

        it("withdraw eth form single fundder", async () => {
          const startingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await FundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );
        });

        it("withdraw with multiple funder", async () => {
          const accounts = await ethers.getSigners();

          for (let i = 0; i < 6; i++) {
            const FundMeContract = await FundMe.connect(accounts[i]);
            await FundMeContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await FundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;

          const endingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );

          // make sure funder array are reset
          await expect(FundMe.getFunder(0)).to.be.reverted;

          for (i = 0; i < 6; i++) {
            assert.equal(await FundMe.getAddressToAmountFunded(accounts[i]), 0);
          }
        });

        it("only allows owner withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[2];
          const fundMeAttacker = await FundMe.connect(attacker);
          await expect(fundMeAttacker.withdraw()).to.be.revertedWithCustomError(
            FundMe,
            "FundMe__NotOwner"
          );
        });
      });

      describe("cheaperWithdraw", () => {
        it("withdraw eth form single fundder", async () => {
          const startingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await FundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );
        });

        it("Cheaper Withdraw multilple fundeer", async () => {
          const accounts = await ethers.getSigners();

          for (let i = 0; i < 6; i++) {
            const FundMeContract = await FundMe.connect(accounts[i]);
            await FundMeContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await FundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;

          const endingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );

          // make sure funder array are reset
          await expect(FundMe.getFunder(0)).to.be.reverted;

          for (i = 0; i < 6; i++) {
            assert.equal(await FundMe.getAddressToAmountFunded(accounts[i]), 0);
          }
        });
      });
    });
