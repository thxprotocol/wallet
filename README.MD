# THX Wallet v0.1.2-alpha

## Description

This repository holds the source for the THX Wallet project built with VueJS.

## Index

1. Prerequisites
2. Install
3. Config
4. Deployment
5. Contract Compilation
6. Testing
7. References

## 1. Prerequisites

-   node v12.16.0
-   nvm 0.35.2
-   yarn 1.22.0
-   firebase-cli 7.13.0
-   solc 0.6.4

## 2. Install

1. `yarn;`
2. `git submodule init;`
3. `git submodule update;`
4. `touch ./src/config.json;`
5. `yarn serve;`

## 3. Config

Populate the `./config.json` file with your credentials following this schema:

```
{
    "firebase": {
        "production": {
            "apiKey": "",
            "authDomain": "",
            "databaseURL": "",
            "projectId": "",
            "storageBucket": "",
            "messagingSenderId": "",
            "appId": ""
        },
        "development": {
            "apiKey": "",
            "authDomain": "",
            "databaseURL": "",
            "projectId": "",
            "storageBucket": "",
            "messagingSenderId": "",
            "appId": ""
        }
    },
    "infura": {
        "key": ""
    }
```

## 4. Deployment

These commands will switch the connected Firebase Database, build the app accordingly and deploy the compiled files to the specified Firebase hosting environment (development or production).

```
yarn deploy:dev;
yarn deploy:prod;
```

## 5. Contract Compilation

```
yarn contracts:compile
```

## 6. Testing

```
Sheer emptiness...
```

## 7. References

-   [Firebase Realtime Database](https://firebase.google.com/docs/database/)
-   [Truffle Migrations](https://www.trufflesuite.com/docs/truffle/getting-started/running-migrations)
-   [Loom Transfer Gateway](https://loomx.io/developers/en/transfer-gateway.html#overview)
-   [Solidity](https://solidity.readthedocs.io/en/v0.6.4/)
-   [Web3.js](https://web3js.readthedocs.io/en/v1.2.6/)
-   [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-solidity.git)
