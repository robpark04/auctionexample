/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

require("./scripts/deploy");
require("./scripts/initialize");
require("./scripts/verify");
require("./scripts/grant-roles");

const { ALCHEMY_RINKEBY_API_URL, DEPLOYER_PRIVATE_KEY, ETHERSCAN_API_KEY } =
  process.env;

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.6" }, { version: "0.8.10" }],
  },
  networks: {
    rinkeby: {
      url: ALCHEMY_RINKEBY_API_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
