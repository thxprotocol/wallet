# Client - THX

## Description
This repository contains the VueJS demo application that will represent the THX Wallet app. The application used the Truffle development framework to implement the web3.js library to set up a connection with MetaMask, obtain an ETH address and transact with a local Ganache/Geth blockchain.

## Index
* Installation
    1. MetaMask Chrome Addon
    2. Ganache CLI
    3. Truffle Development Toolkit
    4. VueJS app
* Applications
    1. Run Ganache CLI
    2. Run MetaMask
* Contract Migrations
* VueJS App
* Open Tasks
* Known issues
* Documentation

## Installation
You need to install these applications to simulate a decentralized blockchain application on your local machine.

* Make sure to have the LTS NodeJS version installed (tested on 10.)

### MetaMask Chrome Addon
Follow the installation instructions carefully and store the backup phrase in your password manager.

* [MetaMask Chrome Addon Installer](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)

### Ganache CLI
This is your local blockchain.
```
npm install -g ganache-cli
```

* [Ganache CLI Documentation](https://github.com/trufflesuite/ganache-cli)

### Truffle Development Toolkit
This is the development toolkit we use for compiling the .sol (Solidity) and deploying them on the network.
```
npm install -g truffle
```

* [Read more about the framework](https://github.com/trufflesuite/truffle)


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

## Applications

### Run Ganache CLI
Start the Ganache blockchain (with 5 user accounts that hold 500 ETH each) and make sure the network runs on port `8545`. The port that is configured for network `ganache` in the file `./truffle.js`.
```
ganache-cli --accounts=5 --defaultBalanceEther=500 --gasPrice=10225000000 --gasLimit=8500000
```

The CLI will show you a list of Private keys like this:
```
Private Keys
==================
(0) 0xd972356378207d318325d4926654edc3be1b3ec7c1d7a77cbf55df90127420e6
(1) 0x06c9727adbf8d7314a60bcb7f434b871b87b9c09764b00f8067f67363365f874
(2) 0x810355c03ec342ab4082b15bb1b2d5cf62011225e16026a236a40fc8d54b5bdc
(3) 0x876d653bb49372ca489c8d633007a7174735e2b90fcbc9a2203e937c8a16d77c
(4) 0x4e563a11a7e27ceb9751b3a3f3552791585e4bce642ad5b8eb11dac2bfb01d5c
...
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

## VueJS app
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

## Open Tasks

* ~~The THX Wallet UI needs to be implemented.~~
* ~~The list of Reward Structs in the RewardPool contract needs to be able to support multiple rewards of various types per beneficiary address.~~
* A splash screen should be shown when you have received a reward. See how to use contract events for this and probably store the state client side.
* Improve Solidity typing for properties and refactor standard contracts.
* Investigate the impact of long lists of rewards in terms of tx cost calculation.
* Investigate Trust Wallet SDK and see if it can work with VueJS for this POC.
* Deploy the contract layer on Ropsten or Rinkeby test network.
* ~~Account without ManageRole should not see Suggested Rewards in notification list~~

## Known issues
```
Error: MetaMask - RPC Error: Internal JSON-RPC error.
```
**Solution:** Toggle between the main network (or any other) and you Localhost 8545 network to reconnect to the RPC. Make sure to import your account with it's private key.

```
Error: Possible EventEmitter memory leak detected. 101 data listeners added. Use emitter.setMaxListeners() to increase limit
```
VueJS compiler tells us there is a memory leak when adding listeners to the network provider. The error occurs after switching views a lot. Might be that network connection should be created on a higher level or earlier in the load.
**Solution:** ...

## Documentation

* [Solidity](https://solidity.readthedocs.io/en/v0.5.0/)
* [web3.js](https://web3js.readthedocs.io/en/1.0/)
* [OpenZeppeling Smart Contracts](https://github.com/OpenZeppelin/openzeppelin-solidity.git)
* [Trust Wallet SDK](https://github.com/TrustWallet/react-native-trust-sdk)
