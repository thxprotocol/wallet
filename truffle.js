const path = require('path')
const {join} = require('path')
const {readFileSync} = require('fs')
const LoomTruffleProvider = require('loom-truffle-provider')
const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();

module.exports = {
    contracts_build_directory: join(__dirname, './src/contracts'),
    networks: {
        ganache: {
            host: "localhost",
            port: 8545,
            network_id: "*"
        },
        loom_dapp_chain: {
            provider: function() {
                const chainId = 'default';
                const writeUrl = 'http://127.0.0.1:46658/rpc';
                const readUrl = 'http://127.0.0.1:46658/query';
                const privateKey = readFileSync(path.join(__dirname, 'loom_private_key'), 'utf-8');
                return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey);
            },
            network_id: '*'
        },
        extdev_plasma_us1: {
            provider: function() {
                const chainId = 'extdev-plasma-us1';
                const writeUrl = 'http://extdev-plasma-us1.dappchains.com:80/rpc';
                const readUrl = 'http://extdev-plasma-us1.dappchains.com:80/query';
                const privateKey = readFileSync(path.join(__dirname, 'extdev_private_key'), 'utf-8');
                return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey);
            },
            network_id: '9545242630824'
        },
        rinkeby: {
            provider: function() {
                if (!process.env.INFURA_API_KEY) {
                    throw new Error("INFURA_API_KEY env var not set")
                }
                return new HDWalletProvider(process.env.RINKEBY_PRIVATE_KEY, "https://rinkeby.infura.io/v3/" + process.env.INFURA_PROJECT_ID)
            },
            network_id: 4,
            gasPrice: 15000000001,
            skipDryRun: true
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(process.env.ROPSTEN_PRIVATE_KEY, "https://ropsten.infura.io/v3/" + process.env.INFURA_PROJECT_ID)
            },
            network_id: 3,
            gas: 2900000
        }
    },
    solc: {
        version: '0.4.24'
    }
};
