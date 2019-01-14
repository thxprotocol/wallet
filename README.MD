# Client - THX

## Current know issues
* Browser console logs
```
The script has an unsupported MIME type ('text/html').
Failed to load resource: net::ERR_INSECURE_RESPONSE
```


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

## Project maintenance
Use these commands to maintain the project, create production builds, run tests and lint code.

### Compiles and hot-reloads for development
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

## Run Ganache CLI
Start the Ganache blockchain and make sure it runs on port `8545` that is configured for network `ganache` in `./truffle.js`.
```
ganache-cli --accounts=5 --defaultBalanceEther=500 --gasPrice=10225000000 --gasLimit=8500000
```
The CLI will show you a list of Private keys like this:
```
Private Keys
==================
(0) 0x5ea301f0398dd2cd7664e66645c9300f3b4f6196cbabd54e1fb86c37bc753a29
(1) 0x3d66acbe328aed737d4d661b63c9c94ac8434c9a847e5d451b8b14e4bf4698ff
(2) 0x68c4ff9c55290d2f269259c90310534a9ea88986bbdc4af24cd8af4a78df1fdf
(3) 0x00f40b7dd48e1411eb9058f1b9f55f91a6ab1f696b9ed079f103d95cb651e828
(4) 0x5c3046fce1dad3564fe2e90f303ba61d7cc3da0c02ed2af5d9a8cb5efc63b98a
```
Copy the first to your clipboard and use it in MetaMask to import an account. See that your balance is about 500 ETH.
