<template>
  <div class="home">
    <h1>Homepage</h1>
    <p>Balance: <strong>{{ balance }}</strong></p>
    <button v-on:click="onClickAddMinter()">Make me minter</button>
  </div>
</template>

<script>
import THXToken from '../../build/contracts/THXToken.json'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'

export default {
  name: 'home',
  data: function () {
    return {
      balance: 0,
      accounts: [],
      providerURL: "http://localhost:8545"
    }
  },
  methods: {
    init() {
      if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
      } else {
        web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL))
      }

      web3.eth.getAccounts((error, result) => {
        this.accounts = result

        this.getBalance(this.accounts[0]).then((result) => {
          this.balance = web3.utils.fromWei(result, 'ether')
        })
      })
    },
    onClickAddMinter() {
      const TruffleContract = require('truffle-contract')
      const THXTokenContract = TruffleContract(THXToken)

      THXTokenContract.setProvider(web3.currentProvider)
      THXTokenContract.defaults({ from: web3.eth.defaultAccount })
      THXTokenContract.deployed().then((instance) => {
        // @TODO Fix the issues logged in browser console
        instance.addMinter(this.accounts[0], { from: this.accounts[0] })
      })
    },
    getBalance (address) {
      return new Promise (function (resolve, reject) {
        web3.eth.getBalance(address, function (error, result) {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        })
      })
    }
  },
  mounted() {
    this.init()
  }
}
</script>
