import Web3 from 'web3'
// import TokenJSON from '../../build/contracts/THXToken.json'
// import RewardPoolJSON from '../../build/contracts/RewardPool.json'

// Ropsten infura config
import TokenJSON from '../contracts/THXToken.json';
import RewardPoolJSON from '../contracts/RewardPool.json';

import EventService from './EventService.js';
import StateService from './StateService.js';

export default class NetworkService {
    constructor() {
        const provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/350a0215b02e46639ff2ac1982de4aed');
        // const provider = new Web3.providers.WebsocketProvider('ws://localhost:8545');
        this.web3 = new Web3(provider);
        this.ea = new EventService();
        this.state = new StateService();
        this.account = {}
        this.accounts = {}
        this.tx = {}
        this.addresses = {
            token: null,
            rewardPool: null
        }
        this.instances = {
            token: null,
            rewardPool: null
        }
    }

    privateKeyToAccount(privateKey) {
        this.state.setItem('privateKey', privateKey);
        window.location.reload();
    }

    sendSignedTransaction(rawTX) {
        let hash;

        return this.web3.eth.sendSignedTransaction(rawTX.rawTransaction)
            .on('transactionHash', (h) => {
                // eslint-disable-next-line
                console.info(h)
            })
            .on('receipt', (receipt) => {
                // eslint-disable-next-line
                console.info(receipt)
            })
            .on('confirmation', (c) => {
                // eslint-disable-next-line
                if (c > 0) this.ea.dispatch('tx.confirmation', { hash: hash, confirmations: c });
            })
            .on('error', (err) => {
                // eslint-disable-next-line
                console.error(err)
            });
    }

    async signContractMethod(to, data) {
        return await this.web3.eth.accounts.signTransaction({
            chainId: this.nid,
            to: to,
            data: data,
            gas: 2000000,
        }, this.state.getItem('privateKey'))
    }

    async signTransaction(to, amount) {
        return await this.web3.eth.accounts.signTransaction({
            chainId: this.nid,
            to: to,
            value: this.web3.utils.toHex(this.web3.utils.toWei(amount, "ether")),
            gas: 2000000
        }, this.state.getItem('privateKey'))
    }

    getAccount() {
        const pKey = this.state.getItem('privateKey');
        const hasKey = (typeof pKey != "undefined" || pKey == "");
        return (hasKey) ? this.web3.eth.accounts.privateKeyToAccount(pKey) : false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.web3.eth.net.getId().then((nid) => {
                const contractsDeployed = (typeof TokenJSON.networks[nid] != 'undefined' && typeof RewardPoolJSON.networks[nid] != 'undefined');

                this.nid = nid;

                if (contractsDeployed) {
                    // Get the contract addresses
                    this.adresses = {
                        token: TokenJSON.networks[nid].address,
                        pool: RewardPoolJSON.networks[nid].address
                    }

                    // Create an instance from the THXToken Contract abi and contract address on the current network
                    this.instances = {
                        token: new this.web3.eth.Contract(TokenJSON.abi, this.adresses.token),
                        pool: new this.web3.eth.Contract(RewardPoolJSON.abi, this.adresses.pool)
                    }

                    this.account = this.getAccount()
                    this.accounts = [this.account.address];

                    if ( this.accounts[0] ) {
                        resolve(true)
                    }
                    else {
                        // eslint-disable-next-line
                        console.warn('Submit your private key first')
                        reject(false);
                    }
                }
            })
        })
    }
}
