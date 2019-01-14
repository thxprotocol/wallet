# Client - THX

## Description
This repository contains the VueJS demo application that will represent the THX Wallet app. The application used the Truffle development framework to implement the web3.js library to set up a connection with MetaMask, obtain an ETH address and transact with a local Ganache/Geth blockchain.

## Index
* Installation
  1. MetaMask Chrome Addon
  2. Ganache CLI
  3. Truffle Development Toolkit
  4. VueJS app
* Run VueJS app
* Run Ganache CLI
* Run MetaMask

## Installation
You need to install these applications to simulate a decentralized blockchain application on your local machine.

* Make sure to have the LTS NodeJS version installed (tested on 10.)

### MetaMask Chrome Addon
Follow the installation instructions carefully and store the backup phrase in your password manager.

* [MetaMask Chrome Addon Installer](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)

### Ganache CLI
This is your local blockchain.

* [Ganache CLI Documentation](https://github.com/trufflesuite/ganache-cli)

```
npm install -g ganache-cli
```

### Truffle Development Toolkit
This is the development toolkit we use for compiling the Solidity code used by the Smart Contracts.

* [Read more about the framework](https://github.com/trufflesuite/truffle)

```
npm install -g truffle
```

### VueJS app
Install the git submodule holding the smart contracts.
```
git submodule init
git submodule update
```
Install the necessary node packages with npm or yarn.
```
npm install
```

## Run applications

### VueJS app
Use these commands to maintain the project, create production builds, run tests and lint code.

```
# Compiles and hot-reloads for development
npm run serve

# Compiles and minifies for production
npm run build

# Run your tests
npm run test

# Lints and fixes files
npm run lint
```

### Run Ganache CLI
Start the Ganache blockchain (with 5 user accounts that hold 500 ETH each) and make sure the network runs on port `8545`. The port that is configured for network `ganache` in the file `./truffle.js`.
```
ganache-cli --accounts=5 --defaultBalanceEther=500 --gasPrice=10225000000 --gasLimit=8500000
```
The CLI will show you a list of Private keys like this:
```
Private Keys
==================
(0) 0x5f1dbafefc649a149ef39012a28b0648baa0a12696d329c99ab46928a00e6bda
(1) 0xdc0f0fdcd19e90b405a5bcaffddceaa37c17e2fa044c569bca41daa95299cafb
(2) 0x2afe8a56203eaae88bb5eba1ecc9b79c00c1f55addc9e141c9bfae637d9a30ce
(3) 0xb92d16caabec881a9513be259ad33e80d474c867da9e0e6fa36ffd5227e337dc
(4) 0xd5c7c7ddf437265bee80cb46a675ce94267d51fee87fe827c3750565cda3365e
```
Copy the first to your clipboard and use it to import an account in MetaMask. See that your balance is about 500 ETH.

### MetaMask
Make sure to have the addon installed and click the icon in your Chrome browser.

1. Select the **Localhost 8545** network.
2. Import an account with the private key shown in your console after starting Ganache CLI

## Contract Migrations
Make sure to compile your Solidity contracts and migrate them on the local Ganache network. Only then the VueJS can read the contracts (due to the created json files in the build folder).
```
truffle migrate --network ganache
```

## Known issues
Browser console logs some error, but they don't affect functionality.
```
The script has an unsupported MIME type ('text/html').
Failed to load resource: net::ERR_INSECURE_RESPONSE
```

## Usefull links

* (How to integratie JS with Smart Contracts)[https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-contract]
