import {
    Client,
    LocalAddress,
    CryptoUtils,
    LoomProvider
} from 'loom-js'
import Web3 from 'web3'
import THXToken from '../contracts/THXToken.json'
import THXTokenRinkeby from '../contracts/THXTokenRinkeby.json'
import RewardPool from '../contracts/RewardPool.json'
import config from '../config.js';

export default class NetworkService {

    async load(loomKey, ethKey) {
        this.onEvent = null
        this._createLoomClient(loomKey)
        this._createEthClient(ethKey)
        this._createLoomAddress()
        this._createEthAddress()
        this._createWebInstances()
        await this._createContractInstances()
    }

    _createLoomClient(key) {
        this.loomPrivateKey = CryptoUtils.B64ToUint8Array(key);
        this.loomPublicKey = CryptoUtils.publicKeyFromPrivateKey(this.loomPrivateKey);
        let writeUrl = 'ws://127.0.0.1:46658/websocket'
        let readUrl = 'ws://127.0.0.1:46658/queryws'
        let networkId = 'default'

        if (process.env.NETWORK == 'extdev') {
            writeUrl = 'wss://extdev-plasma-us1.dappchains.com/websocket'
            readUrl = 'wss://extdev-plasma-us1.dappchains.com/queryws'
            networkId = 'extdev-plasma-us1'
        }

        this.client = new Client(networkId, writeUrl, readUrl)

        this.client.on('error', msg => {
            // eslint-disable-next-line
            console.error('Error on connect to client', msg)
            // eslint-disable-next-line
            console.warn('Please verify if loom command is running')
        })
    }

    _createEthClient(key) {
        this.ethPrivateKey = `0x${key}`;
    }

    _createLoomAddress() {
        this.loomAddress = LocalAddress.fromPublicKey(this.loomPublicKey).toString().toLowerCase();
    }

    _createEthAddress() {
        const web3 = new Web3;
        const account = web3.eth.accounts.privateKeyToAccount(this.ethPrivateKey);
        this.ethAddress = account.address;
    }

    _createWebInstances() {
        this.loomWeb3 = new Web3(new LoomProvider(this.client, this.loomPrivateKey))
        this.ethWeb3 = new Web3(`wss://rinkeby.infura.io/ws/v3/${config.infura.apiKey}`)
    }

    _getCurrentLoomNetwork() {
        if (process.env.NETWORK == 'extdev') {
            return '9545242630824'
        } else {
            return this.loomWeb3.eth.net.getId().then((nid) => {
                return nid
            });
        }
    }

    _getCurrentEthNetwork() {
        return this.ethWeb3.eth.net.getId().then((nid) => {
            return nid
        });
    }

    async _createContractInstances() {
        this.loomNetworkId = await this._getCurrentLoomNetwork()
        this.ethNetworkId = await this._getCurrentEthNetwork()

        if (!THXToken.networks[this.loomNetworkId] || !RewardPool.networks[this.loomNetworkId]) {
            throw Error('Contracts not deployed on DAppChain')
        }

        if (!THXTokenRinkeby.networks[this.ethNetworkId]) {
            throw Error('Contract not deployed on Rinkeby')
        }

        this.instances = {
            tokenRinkeby: new this.ethWeb3.eth.Contract(THXTokenRinkeby.abi, THXTokenRinkeby.networks[this.ethNetworkId].address, { from: this.ethAddress }),
            token: new this.loomWeb3.eth.Contract(THXToken.abi, THXToken.networks[this.loomNetworkId].address, { from: this.loomAddress }),
            pool: new this.loomWeb3.eth.Contract(RewardPool.abi, RewardPool.networks[this.loomNetworkId].address, { from: this.loomAddress })
        }
    }
}
