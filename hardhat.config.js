/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.6" }, { version: "0.8.10" }],
  },
  networks: {
    rinkeby: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: "7H149Y186N8389C3U4BY3Q2GT5IAYS4RNM",
      ropsten: "7H149Y186N8389C3U4BY3Q2GT5IAYS4RNM",
      rinkeby: "7H149Y186N8389C3U4BY3Q2GT5IAYS4RNM",
    },
  },
};
