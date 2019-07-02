import Web3 from 'web3'
// import TokenJSON from '../../build/contracts/THXToken.json'
// import RewardPoolJSON from '../../build/contracts/RewardPool.json'

// Ropsten infura config
import TokenJSON from '../contracts/THXToken.json'
import RewardPoolJSON from '../contracts/RewardPool.json'

import EventService from './EventService.js';
import StateService from './StateService.js';

export default class NetworkService {
    constructor() {
        // 0x9631698A3AA4330681E0653DF5B0F52F0E38296D67B681CE4A7FF187108A2706
        this.web3 = new Web3("https://ropsten.infura.io/v3/350a0215b02e46639ff2ac1982de4aed");
        // this.web3 = new Web3("http://localhost:8545");
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
        localStorage.setItem('privateKey', privateKey);
        window.location.reload();
    }

    saveTransaction(hash, description) {
        let txList = this.state.get('tx');
        if (!txList) txList = []
        txList.push(hash)
        localStorage.setItem('tx', JSON.stringify(txList));

        this.ea.dispatch('tx.confirmation', {
            hash: hash,
            description: description,
            confirmations: 0,
        })
    }

    sendSignedTransaction(rawTX, description) {
        let hash;

        return this.web3.eth.sendSignedTransaction(rawTX.rawTransaction)
            .on('transactionHash', (h) => {
                // eslint-disable-next-line
                console.info(h)
                hash = h;
                this.saveTransaction(h, description);
            })
            .on('receipt', (receipt) => {
                // eslint-disable-next-line
                console.info(receipt)
            })
            .on('confirmation', (c) => {
                // eslint-disable-next-line
                console.log(c)
                this.ea.dispatch('tx.confirmation', {
                    hash: hash,
                    confirmations: c,
                });
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
        }, localStorage.privateKey)
    }

    async signTransaction(to, amount) {
        return await this.web3.eth.accounts.signTransaction({
            chainId: this.nid,
            to: to,
            value: this.web3.utils.toHex(this.web3.utils.toWei(amount, "ether")),
            gas: 2000000
        }, localStorage.privateKey)
    }

    getAccount() {
        const hasKey = (typeof localStorage.privateKey != "undefined" || localStorage.privateKey == "");
        return (hasKey) ? this.web3.eth.accounts.privateKeyToAccount(localStorage.privateKey) : false;
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
