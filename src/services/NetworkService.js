import {
    Client,
    LocalAddress,
    CryptoUtils,
    LoomProvider
} from 'loom-js'
import Web3 from 'web3'
import THXToken from '../contracts/THXToken.json'
import RewardPool from '../contracts/RewardPool.json'

export default class NetworkService {

    async load(key) {
        this.onEvent = null
        this._createClient(key)
        this._createCurrentUserAddress()
        this._createWebInstance()
        await this._createContractInstances()
    }

    _createClient(key) {
        this.privateKey = CryptoUtils.B64ToUint8Array(key);
        this.publicKey = CryptoUtils.publicKeyFromPrivateKey(this.privateKey);
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

    _createCurrentUserAddress() {
        this.currentUserAddress = LocalAddress.fromPublicKey(this.publicKey).toString().toLowerCase();
    }

    _createWebInstance() {
        this.web3 = new Web3(new LoomProvider(this.client, this.privateKey))
    }

    _getCurrentNetwork() {
        if (process.env.NETWORK == 'extdev') {
            return '9545242630824'
        } else {
            return this.web3.eth.net.getId().then((nid) => {
                return nid
            });
        }
    }

    async _createContractInstances() {
        const networkId = await this._getCurrentNetwork()

        if (!THXToken.networks[networkId] || !RewardPool.networks[networkId]) {
            throw Error('Contract not deployed on DAppChain')
        }

        this.instances = {
            token: new this.web3.eth.Contract(THXToken.abi, THXToken.networks[networkId].address, { from: this.currentUserAddress }),
            pool: new this.web3.eth.Contract(RewardPool.abi, RewardPool.networks[networkId].address, { from: this.currentUserAddress })
        }

        this.instances.token.events.Transfer({}, (err, event) => {
            if (err) {
                // eslint-disable-next-line
                console.error('Error on event', err)
            }
            else {
                if (this.onEvent) {
                    this.onEvent(event.returnValues)
                }
            }
        })
    }
}
