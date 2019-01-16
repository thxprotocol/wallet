<template>
  <div class="home">
    <h1>Homepage</h1>
    <p>Balance (ETH): <strong>{{ balanceETH }}</strong></p>
    <p>Balance (THX): <strong>{{ balanceTHX }}</strong></p>
    <button v-on:click="onClickMint()">Mint 1000 THX</button>
  </div>
</template>

<script>
/*globals web3:true*/

import THXTokenJSON from '../../build/contracts/THXToken.json'
import Web3 from 'web3'

export default {
  name: 'home',
  data: function () {
    return {
      balanceETH: 0,
      balanceTHX: 0,
      accounts: [],
      providerURL: "http://localhost:8545"
    }
  },
  methods: {
    async init() {
      if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
      } else {
        web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL))
      }

      // Get the network id
      const nid = await web3.eth.net.getId()

      // Create an instance from the THXToken Contract abi and contract address on the current network
      this.thxTokenInstance = new web3.eth.Contract(THXTokenJSON.abi, THXTokenJSON.networks[nid].address)

      // Retrieve the accounts available on the network
      await web3.eth.getAccounts((error, accounts) => {
        // Store the accounts
        this.accounts = accounts
      })

      // Update the balances for account 0
      this.updateBalances(this.accounts[0])
    },
    async updateBalances(account) {
      // Retrieve the amount of Wei for account 0
      let amountInWei = await web3.eth.getBalance(account)

      // Calculate the amount of ETH from Wei
      this.balanceETH = web3.utils.fromWei(amountInWei, 'ether')

      // Retrieve the amount of THX for account 0
      this.balanceTHX = await this.thxTokenInstance.methods.balanceOf(account).call()
    },
    async onClickMint() {
      // Mint 1000 THX for account 0. Make sure to call from account 0 that has the MinterRole
      await this.thxTokenInstance.methods.mint(this.accounts[0], 1000).send({from: this.accounts[0]})

      // Update the balances for account 0
      this.updateBalances(this.accounts[0])
    }
  },
  mounted() {
    this.init()
  }
}
</script>
