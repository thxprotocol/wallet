import { Client,
    LocalAddress,
    CryptoUtils,
    LoomProvider,
} from 'loom-js';
import Web3 from 'web3';
const THXToken = require('../contracts/THXToken.json');
const RinkebyGateway = require('../Gateway.json');
const Config = require('../config.js');
const THXTokenRinkeby = require('../contracts/THXTokenRinkeby.json');
const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));
const gas = 350000;

export default class NetworkService {
    public rinkeby: Web3;
    public loomPrivateKey: string;
    public rinkebyPrivateKey: string;
    public instances: any;
    public loom: any;
    public account: any;
    public client: any;

    constructor(loomPrivateKey: string, rinkebyPrivateKey: string) {
        this.rinkeby = new Web3(`wss://rinkeby.infura.io/ws/v3/${Config.infura.key}`);
        this.loomPrivateKey = loomPrivateKey;
        this.rinkebyPrivateKey = rinkebyPrivateKey;
    }

    public async init() {
        let networkConfig;

        if (this.rinkebyPrivateKey) {
            this.rinkeby.account = this.rinkeby.eth.accounts.privateKeyToAccount(this.rinkebyPrivateKey);
        }

        if (process.env.NETWORK === 'ganache') {
            this.loom = new Web3('ws://localhost:8545');
            this.account = this.loom.eth.accounts.privateKeyToAccount(`0x${this.loomPrivateKey}`);
        }

        if ((process.env.NETWORK !== 'ganache') && this.loomPrivateKey) {
            networkConfig = this._networkConfig(this.loomPrivateKey);

            this.loom = await new Web3( this._networkProvider(networkConfig.privateArray) );
            this.account = networkConfig;
        }

        return new Promise(async (resolve, reject) => {
            if (this.loomPrivateKey && this.rinkebyPrivateKey) {
                this.instances = {
                    token: await this.contract(THXToken, null),
                    tokenRinkeby: this.rinkebyContract(THXTokenRinkeby, this.rinkeby.account.address),
                    gateway: this.rinkebyContract(RinkebyGateway, this.rinkeby.account.address),
                };
                resolve(this.instances);
            } else {
                reject('Instances not loaded due to missing Loom and Rinkeby private keys.');
            }
        });
    }

    get hasKeys() {
        return this.loomPrivateKey && this.rinkebyPrivateKey;
    }

    // Returns the default network Contract class
    // @param address If set to null the default network will apply
    public async contract(json: any, address: string) {
        const Contract = this.loom.eth.Contract;
        let nid;

        if (!address) {
            nid = await this.loom.eth.net.getId();
            address = json.networks[nid].address;
        }

        return new Contract(json.abi, address, { from: this.account.address });
    }

    // Returns a Rinkeby Contract class
    public rinkebyContract(json: any, account: any) {
        const Contract = this.rinkeby.eth.Contract;
        return new Contract(json.abi, json.networks[4].address, { from: account });
    }

    public async mint(address: string, amount: number) {
        let tx;
        const tokenAmount = new BN(amount).mul(tokenMultiplier);
        const contractAddress = this.instances.tokenRinkeby._address;
        const data = this.instances.tokenRinkeby.methods.mint(address, tokenAmount.toString()).encodeABI();

        tx = await this._signContractMethod(contractAddress, data);
        return await this._sendSignedTransaction(tx.rawTransaction);
    }

    // Create loom account for private key
    public _networkConfig(privateKey: string) {
        const privateKeyArray = CryptoUtils.B64ToUint8Array(privateKey);
        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKeyArray);
        const address = LocalAddress.fromPublicKey(publicKey).toString().toLowerCase();

        return {
            address,
            privateKey,
            privateArray: privateKeyArray,
            public: publicKey,
        };
    }

    // Get the loom provider configuration
    public _networkProvider(privateKey: string) {
        let writeUrl!: string,
            readUrl!: string,
            networkId!: string,
            client!: any;

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

        this.client = client = new Client(networkId, writeUrl, readUrl);

        this.client.on('error', (msg: string) => {
            // eslint-disable-next-line
            console.error('Error on connect to client', msg);
            // eslint-disable-next-line
            console.warn('Please verify if loom command is running');
        });

        return new LoomProvider(client, privateKey);
    }

    public async _signContractMethod(to: string, data: any) {
        return await this.rinkeby.eth.accounts.signTransaction({
            chainId: 4,
            to,
            data,
            gas,
        }, this.rinkebyPrivateKey);
    }

    public async _sendSignedTransaction(tx: string) {
        return await this.rinkeby.eth.sendSignedTransaction(tx)
            .on('transactionHash', (t: string) => {
                // eslint-disable-next-line
                console.info(t);
            })
            .on('receipt', (r: any) => {
                // eslint-disable-next-line
                console.info(r);
            })
            .on('confirmation', (l: string) => {
                // eslint-disable-next-line
                console.info(l);
            })
            .on('error', (e: string) => {
                // eslint-disable-next-line
                console.error(e);
            });
    }
}
