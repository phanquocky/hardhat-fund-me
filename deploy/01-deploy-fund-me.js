const {
  networkConfig,
  networkDevelopment,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  console.log(deployer);

  let priceFeedAddress;
  if (networkDevelopment.includes(network.name)) {
    const MockV3Aggregator = await get("MockV3Aggregator");
    priceFeedAddress = MockV3Aggregator.address;
  } else {
    priceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  console.log(`Price Feed address: ${priceFeedAddress}`);
  const args = [priceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    blockConfirmations: network.config.blockConfirmations || 1,
  });
  log("--------------------------");
  if (
    !networkDevelopment.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("verify", verify);
    console.log("fundme address", fundMe.address);
    await verify(fundMe.address, args);
  }
};
module.exports.tags = ["all", "fundme"];
