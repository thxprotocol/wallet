const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();

module.exports = {
    networks: {
        ganache: {
            host: "localhost",
            port: 8545,
            network_id: "*"
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(
                    process.env.PRIVATE_KEY,
                    "https://ropsten.infura.io/v3/" + process.env.INFURA_PROJECT_ID
                )
            },
            network_id: 3,
            gas: 2900000
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};
