# THX Wallet v0.1.2-alpha

## Description
The THX

## Index
1. Prerequisites
2. Install
3. Deployment
4. Contract Migrations
5. Transfer Gateway
6. Testing
7. Known issues
8. References

## 1. Prerequisites
* nodejs v12.16.0
* nvm 0.35.2
* yarn 1.22.0

## 2. Install
1. `npm install;`
2. `git submodule init; git submodule update;`
3. `touch extdev_private_key; echo "EXTDEV_PRIVATE_KEY" >> extdev_private_key;`
4. `touch rinkeby_private_key; echo "RINKEBY_PRIVATE_KEY" >> rinkeby_private_key;`
5. `touch .env;`
6. `touch ./src/config.json;`

Populate the `.env` file with:
```
RINKEBY_PRIVATE_KEY="0x0000000000000000000000000000000000000000000000000000000000000000"
INFURA_API_KEY="000a0a00000a000a000000a"
```
Populate the `.config.json` file with your credentials following this schema:
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

## 2. Deployment

### VueJS app
These commands will switch the connected Firebase Database, build the app accordingly and deploy the compiled files to the specified Firebase hosting environment (development or production).
```
yarn deploy:dev;
yarn deploy:prod;
```

### Firebase Functions
Firebase Functions are specified in the `./functions` folder. There are Express instances created for the API and the Slack Proxy. This is how you publish them:
```
yarn deploy:api:dev;
yarn deploy:api:prod;

yarn deploy:slack:dev;
yarn deploy:slack:prod;
```

## 3. Contract Migrations
We use `truffle` to compile contract data and deploy them onto the networks specified. Configuration is found in `./truffle.js`.

### 4. Deploy on Extdev
Loom's Extdev network is used for most Reward Pool interactions and holds most of the Solidity logic.
```
yarn deploy:reset:extdev;
```

### 5. Deploy on Rinkeby
Ethereum's Rinkeby test network is used for de deployment of the ERC-20 Smart Contract for the THX token. It will be mapped to the Extdev equivalent of that contract by the Transfer Gateway to setup a two-way peg.
```
yarn deploy:reset:rinkeby;
```

## 6. Transfer Gateway
Transfer Gateway helper methods are currently found in `gateway-cli.js`. Only one method is used currently to map contracts. Account mappings are set up during account creating in the wallet.
```
yarn map-contracts
```

### 7. Testing

```
Sheer emptiness...
```

## 8. References
* [Firebase Realtime Database](https://firebase.google.com/docs/database/)
* [Truffle Migrations](https://www.trufflesuite.com/docs/truffle/getting-started/running-migrations)
* [Loom Transfer Gateway](https://loomx.io/developers/en/transfer-gateway.html#overview)
* [Solidity](https://solidity.readthedocs.io/en/v0.6.4/)
* [Web3.js](https://web3js.readthedocs.io/en/v1.2.6/)
* [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-solidity.git)
