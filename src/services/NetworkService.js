import { Client,
    LocalAddress,
    CryptoUtils,
    LoomProvider,
    NonceTxMiddleware,
    SignedTxMiddleware,
    Address,
    Contracts,
    Web3Signer,
    soliditySha3
} from 'loom-js';

const TransferGateway = Contracts.TransferGateway;
const AddressMapper = Contracts.AddressMapper;
const EthToken = Contracts.EthToken;

import Web3 from 'web3';
import THXToken from '../contracts/THXToken.json';
import THXTokenRinkeby from '../contracts/THXTokenRinkeby.json';
import RinkebyGateway from '../Gateway.json';
import Config from '../config.js';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));
const rinkebyGatewayAddress = '0x9c67fD4eAF0497f9820A3FBf782f81D6b6dC4Baa'

const gas = 350000;

export default class NetworkService {
    constructor(loomPrivateKey, rinkebyPrivateKey) {
        this.rinkeby = new Web3(`wss://rinkeby.infura.io/ws/v3/${Config.infura.key}`);
        this.loomPrivateKey = loomPrivateKey;
        this.rinkebyPrivateKey = rinkebyPrivateKey;
    }

    async init() {
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
            }
            else {
                reject('Instances not loaded due to missing Loom and Rinkeby private keys.');
            }
        });
    }

    get hasKeys() {
        return this.loomPrivateKey && this.rinkebyPrivateKey
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

        this.client = client = new Client(networkId, writeUrl, readUrl);

        this.client.on('error', msg => {
            // eslint-disable-next-line
            console.error('Error on connect to client', msg)
            // eslint-disable-next-line
            console.warn('Please verify if loom command is running')
        });

        return new LoomProvider(client, privateKey);
    }

    async depositToRinkebyGateway(amount) {
        let data, tx;
        const tokenAmount = new BN(amount).mul(tokenMultiplier);
        const token = this.instances.tokenRinkeby;
        const tokenAddress = this.instances.tokenRinkeby._address;
        const gateway = this.instances.gateway;

        data = token.methods.approve(rinkebyGatewayAddress, tokenAmount.toString()).encodeABI();
        tx = await this._signContractMethod(tokenAddress, data);

        await this._sendSignedTransaction(tx.rawTransaction);

        data = gateway.methods.depositERC20(tokenAmount.toString(), tokenAddress).encodeABI();
        tx = await this._signContractMethod(rinkebyGatewayAddress, data);

        return await this._sendSignedTransaction(tx.rawTransaction);
    }

    async withdrawFromRinkebyGateway(amount) {
        const gas = 350000;
        const signature = this.depositToExtdevGateway({
            client: this.client,
            web3js: this.loom,
            amount: amount,
            ownerExtdevAddress: this.account.address,
            ownerRinkebyAddress: this.account.rinkeby.address,
            tokenExtdevAddress: this.token._address,
            tokenRinkebyAddress: this.tokenRinkeby._address,
            timeout: 120000
        });
        const networkId = await this.rinkeby.eth.net.getId()
        const gasEstimate = await this.instances.tokenRinkeby.methods.withdrawERC20(amount.toString(), signature, THXTokenRinkeby.networks[networkId].address).estimateGas({from: this.account.address, gas})

        if (gasEstimate == gas) {
            throw new Error('Not enough enough gas, send more.')
        }

        return this.instances.tokenRinkeby.methods.withdrawERC20(amount.toString(), signature, THXTokenRinkeby.networks[networkId].address).send({from: this.account.address, gas: gasEstimate});
    }

    // Returns a promise that will be resolved with a hex string containing the signature that must
    // be submitted to the Ethereum Gateway to withdraw a token.
    async depositToExtdevGateway({
        client,
        web3js,
        amount,
        ownerExtdevAddress,
        ownerRinkebyAddress,
        tokenExtdevAddress,
        tokenRinkebyAddress,
        timeout
    }) {
        const ownerExtdevAddr = Address.fromString(`${client.chainId}:${ownerExtdevAddress}`)
        const gatewayContract = await TransferGateway.createAsync(client, ownerExtdevAddr)

        const tokenContract = await getExtdevTokenContract(web3js)
        await tokenContract.methods.approve(extdevGatewayAddress.toLowerCase(), amount.toString()).send({from: ownerExtdevAddress})

        const ownerRinkebyAddr = Address.fromString(`eth:${ownerRinkebyAddress}`)
        const receiveSignedWithdrawalEvent = new Promise((resolve, reject) => {
            let timer = setTimeout(() => reject(new Error('Timeout while waiting for withdrawal to be signed')), timeout)
            const listener = event => {
                const tokenEthAddr = Address.fromString(`eth:${tokenRinkebyAddress}`)
                if (event.tokenContract.toString() === tokenEthAddr.toString() && event.tokenOwner.toString() === ownerRinkebyAddr.toString()) {
                    clearTimeout(timer)
                    timer = null
                    gatewayContract.removeAllListeners(TransferGateway.EVENT_TOKEN_WITHDRAWAL)
                    resolve(event)
                }
            }
            gatewayContract.on(TransferGateway.EVENT_TOKEN_WITHDRAWAL, listener)
        })

        const tokenExtdevAddr = Address.fromString(`${client.chainId}:${tokenExtdevAddress}`)
        await gatewayContract.withdrawERC20Async(amount, tokenExtdevAddr, ownerRinkebyAddr)
        console.log(`${amount.div(tokenMultiplier).toString()} tokens deposited to DAppChain Gateway...`)

        const event = await receiveSignedWithdrawalEvent
        return CryptoUtils.bytesToHexAddr(event.sig)
    }


    async mint(address, amount) {
        let tx;
        const tokenAmount = new BN(amount).mul(tokenMultiplier);
        const contractAddress = this.instances.tokenRinkeby._address;
        const data = this.instances.tokenRinkeby.methods.mint(address, tokenAmount.toString()).encodeABI();

        tx = await this._signContractMethod(contractAddress, data);
        return await this._sendSignedTransaction(tx.rawTransaction);
    }

    async _signContractMethod(to, data) {
        return await this.rinkeby.eth.accounts.signTransaction({
            chainId: 4,
            to: to,
            data: data,
            gas: gas,
        }, this.rinkebyPrivateKey);
    }

    async _sendSignedTransaction(tx) {
        return await this.rinkeby.eth.sendSignedTransaction(tx)
            .on('transactionHash', (t) => {
                // eslint-disable-next-line
                console.info(t);
            })
            .on('receipt', (r) => {
                // eslint-disable-next-line
                console.info(r);
            })
            .on('confirmation', (l) => {
                // eslint-disable-next-line
                console.info(l);
            })
            .on('error', (e) => {
                // eslint-disable-next-line
                console.error(e);
            });
    }
}
