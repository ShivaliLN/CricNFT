/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-truffle5")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("@appliedblockchain/chainlink-plugins-fund-link")

require('dotenv').config()

const RINKEBY_RPC_URL = process.env.RINKEBY_URL;
const KOVAN_RPC_URL = process.env.KOVAN_URL;
const POLYGON_RPC_URL = process.env.POLYGON_URL;

//const MNEMONIC = process.env.MNEMONIC || "your mnemonic"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_KEY;
const POLYGON_API_KEY = process.env.POLYGONSCAN_KEY;
// optional
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
    //defaultNetwork: "hardhat",
    networks: {
        hardhat: {
        },
        kovan: {
            url: KOVAN_RPC_URL,
             accounts: [PRIVATE_KEY],
            //accounts: {
           //     mnemonic: MNEMONIC,
           // },
            saveDeployments: true,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            // accounts: [PRIVATE_KEY],
            accounts: [PRIVATE_KEY],
            saveDeployments: true,
        },
        mumbai: {
            url: POLYGON_RPC_URL,
            accounts: [PRIVATE_KEY],
            saveDeployments: true,
        },     
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: ETHERSCAN_API_KEY
       // apiKey: POLYGON_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0 // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        feeCollector: {
            default: 1
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.7"
            },
            {
                version: "0.6.6"
            },
            {
                version: "0.4.24"
            }
        ]
    },
    paths: {
        artifacts: './src/artifacts',
      },
    mocha: {
        timeout: 100000
    }
}

