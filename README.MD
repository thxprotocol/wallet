# Client - THX

## Description
This repository contains the VueJS demo application that will represent the THX Wallet app. The application used the Truffle development framework to implement the web3.js library to set up a connection with MetaMask, obtain an ETH address and transact with a local Ganache/Geth blockchain.

## Install the MetaMask Chrome Addon
Follow the installation instructions carefully and store the backup phrase in your password manager.
* [MetaMask Chrome Addon Installer](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)

## Install Ganache UI or Ganache CLI
This is your local blockchain.
* [Ganache UI Installer](https://truffleframework.com/ganache) and follow the instructions.
* [Ganache CLI Documentation](https://github.com/trufflesuite/ganache-cli)
```
npm install -g ganache-cli
```

## Install Truffle globally
This is the development toolkit we use for compiling the Solidity code used by the Smart Contracts.
[Read more about the framework](https://github.com/trufflesuite/truffle)
```
npm install -g truffle
```

## Project setup
Install the git submodule holding the smart contracts.
```
git submodule init
git submodule update
```
Install the necessary node packages with npm or yarn.
```
npm install
```

### Compiles and hot-reloads for development
Run the vuejs application
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```
