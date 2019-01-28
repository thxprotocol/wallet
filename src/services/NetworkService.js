/*global web3*/
import Web3 from 'web3'

import TokenJSON from '../../build/contracts/THXToken.json'
import RewardPoolJSON from '../../build/contracts/RewardPool.json'

// import config from '../config.js'

export default class NetworkService {
    constructor() {
        this.web3 = web3

        if (typeof web3 !== 'undefined') {
            this.web3 = new Web3(this.web3.currentProvider); // @TODO When deploying make sure this is ropsten through infura since we deprecate the use of metamask
        } else {
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
        }

        this.account = {}
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
    }

    sendSignedTransaction(rawTX) {
        return this.web3.eth.sendSignedTransaction(rawTX.rawTransaction).on('receipt', (receipt) => {
            return receipt
        })
    }

    signTransaction(to, amount) {
        return this.web3.eth.accounts.signTransaction({
            to: to,
            value: this.web3.utils.toHex(this.web3.utils.toWei(amount, "ether")),
            gas: 2000000
        }, localStorage.privateKey)
    }

    getAccount() {
        if (typeof localStorage.privateKey != 'undefined' || localStorage.privateKey == "") {
            return this.web3.eth.accounts.privateKeyToAccount(localStorage.privateKey);
        }
        else {
            return false
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.web3.eth.net.getId().then((nid) => {
                //
                // this.web3.eth.getAccounts((error, accounts) => {
                //   let instances = {
                //     token: new this.web3.eth.Contract(config.abi.token, config.address.token),
                //     pool: new this.web3.eth.Contract(config.abi.pool, config.address.pool)
                //   }
                //
                //   resolve({
                //     nid: nid,
                //     addresses: config.address,
                //     instances: instances,
                //     accounts: accounts
                //   })
                // })

                if (typeof TokenJSON.networks[nid] != 'undefined' && typeof RewardPoolJSON.networks[nid] != 'undefined') {
                    let addresses = {}
                    let instances = {}

                    // Get the contract addresses
                    this.adresses = addresses = {
                        token: TokenJSON.networks[nid].address,
                        pool: RewardPoolJSON.networks[nid].address
                    }

                    // Create an instance from the THXToken Contract abi and contract address on the current network
                    this.instances = instances = {
                        token: new this.web3.eth.Contract(TokenJSON.abi, addresses.token),
                        pool: new this.web3.eth.Contract(RewardPoolJSON.abi, addresses.pool)
                    }

                    this.account = this.getAccount()

                    if (this.account) {
                        resolve({nid: nid, addresses: addresses, instances: instances, accounts: [this.account.address]})
                    }
                    else {
                        console.log('Submit your private key first')
                        reject()
                    }

                } else {
                    reject()
                }

            })
        })
    }
}
