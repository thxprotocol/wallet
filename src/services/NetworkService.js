import { Client, LocalAddress, CryptoUtils, LoomProvider } from 'loom-js';
import Web3 from 'web3';
import THXToken from '../contracts/THXToken.json';
import THXTokenRinkeby from '../contracts/THXTokenRinkeby.json';
import RinkebyGateway from '../Gateway.json';
import Config from '../config.js';

export default class NetworkService {
    constructor(loomPrivateKey, rinkebyPrivateKey) {
        this.loomPrivateKey = loomPrivateKey;
        this.rinkebyPrivateKey = rinkebyPrivateKey;
    }

    async init() {
        let networkConfig;

        if (this.rinkebyPrivateKey) {
            this.rinkeby = new Web3(`wss://rinkeby.infura.io/ws/v3/${Config.infura.key}`);
            this.rinkeby.account = this.rinkeby.eth.accounts.privateKeyToAccount(`0x${this.rinkebyPrivateKey}`);
        }

        if (process.env.NETWORK === 'ganache') {
            this.loom = new Web3('ws://localhost:8545');
            this.account = this.loom.eth.accounts.privateKeyToAccount(`0x${Config.ganache.private}`);
        }

        if ((process.env.NETWORK !== 'ganache') && this.loomPrivateKey) {
            networkConfig = this._networkConfig(this.loomPrivateKey);

            this.loom = await new Web3( this._networkProvider(networkConfig.privateArray) );
            this.account = networkConfig;
        }

        return new Promise(async (resolve) => {
            this.instances = {
                token: await this.contract(THXToken, null),
                tokenRinkeby: this.rinkebyContract(THXTokenRinkeby, this.rinkeby.account.address),
                gateway: this.rinkebyContract(RinkebyGateway, this.rinkeby.account.address),
            };

            resolve(this.instances);
        });
    }

    // Returns the default network Contract class
    // @param address If set to null the default network will apply
    async contract(json, address) {
        const Contract = this.loom.eth.Contract;
        let nid;

        if (!address) {
            nid = await this.loom.eth.net.getId();
            address = json.networks[nid].address;
        }

        return new Contract(json.abi, address, { from: this.account.address });
    }

    // Returns a Rinkeby Contract class
    rinkebyContract(json, account) {
        const Contract = this.rinkeby.eth.Contract;

        return new Contract(json.abi, json.networks[4].address, { from: account })
    }

    // Create loom account for private key
    _networkConfig(privateKey) {
        const privateKeyArray = CryptoUtils.B64ToUint8Array(privateKey);
        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKeyArray);
        const address = LocalAddress.fromPublicKey(publicKey).toString().toLowerCase();

        return {
            address: address,
            privateKey: privateKey,
            privateArray: privateKeyArray,
            public: publicKey,
        }
    }

    // Get the loom provider configuration
    _networkProvider(privateKey) {
        let writeUrl, readUrl, networkId, client;

        if (!process.env.NETWORK) {
            writeUrl = 'ws://127.0.0.1:46658/websocket';
            readUrl = 'ws://127.0.0.1:46658/queryws';
            networkId = 'default';
        }

        if (process.env.NETWORK === 'extdev') {
            writeUrl = 'wss://extdev-plasma-us1.dappchains.com/websocket';
            readUrl = 'wss://extdev-plasma-us1.dappchains.com/queryws';
            networkId = 'extdev-plasma-us1';
        }

        client = new Client(networkId, writeUrl, readUrl);

        client.on('error', msg => {
            // eslint-disable-next-line
            console.error('Error on connect to client', msg)
            // eslint-disable-next-line
            console.warn('Please verify if loom command is running')
        });

        return new LoomProvider(client, privateKey);
    }
}
