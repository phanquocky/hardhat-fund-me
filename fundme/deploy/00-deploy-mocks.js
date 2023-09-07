const { network } = require("hardhat");
const {
  networkDevelopment,
  DECIMALS,
  INIT_ANSWER,
} = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (networkDevelopment.includes(network.name)) {
    log("Development network is Detected!");
    log("Deploy Mock contract");
    const MockV3Aggregator = await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INIT_ANSWER],
      log: true,
    });
    log("Contract deployed!");
    log("----------------------------------------------------------------");
  }
};

module.exports.tags = ["all", "mock"];
