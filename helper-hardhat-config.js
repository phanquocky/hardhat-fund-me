const networkConfig = {
  80001: {
    name: "matic",
    ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
  },
  //31337
};

const networkDevelopment = ["hardhat", "localhost"];
const DECIMALS = 8;
const INIT_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  networkDevelopment,
  DECIMALS,
  INIT_ANSWER,
};
