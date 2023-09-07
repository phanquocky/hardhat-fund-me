const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const FundMe = await ethers.getContract("FundMe", deployer);
  console.log("Withdraw....");
  const transactionResponse = await FundMe.withdraw();
  const transactionReceipt = transactionResponse.wait(1);
  console.log("Withdraw!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
