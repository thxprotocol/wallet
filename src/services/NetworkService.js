/*globals web3:true*/
import Web3 from 'web3'

import TokenJSON from '../../build/contracts/THXToken.json'
import RewardPoolJSON from '../../build/contracts/RewardPool.json'

export default class NetworkService {
  constructor(web3) {
    if (typeof web3 !== 'undefined') {
      this.web3 = new Web3(web3.currentProvider);
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    }

    this.accounts = []

    this.addresses = {
      token: null,
      rewardPool: null
    }

    this.instances = {
      token: null,
      rewardPool: null
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.web3.eth.net.getId().then( (nid) => {

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

          web3.eth.getAccounts((error, accounts) => {
            this.accounts = accounts

            resolve({
              addresses: addresses,
              instances: instances,
              accounts: accounts
            })
          })
        }
        else {
          reject()
        }
      })
    })
  }
}
