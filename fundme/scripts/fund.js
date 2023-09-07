const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const FundMe = await ethers.getContract("FundMe", deployer);
  console.log("Fund....");
  const transactionResponse = await FundMe.fund({
    value: ethers.parseEther("0.1"),
  });
  const transactionReceipt = transactionResponse.wait(1);
  console.log("funded!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
