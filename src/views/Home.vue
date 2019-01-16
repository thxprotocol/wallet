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
    init() {
      if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
      } else {
        web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL))
      }


      // Set up an async method that retrieves the accounts on the network
      web3.eth.getAccounts(async (error, accounts) => {
        // Get the network id
        const nid = await web3.eth.net.getId()

        // Create an instance from the THXToken Contract abi and contract address on the current network
        let THXTokenInstance = new web3.eth.Contract(THXTokenJSON.abi, THXTokenJSON.networks[nid].address)

        // Store the accounts
        this.accounts = accounts

        // Retrieve the amount of Wei for account 0
        let amountInWei = await web3.eth.getBalance(this.accounts[0])

        // Calculate the amount of ETH from Wei
        this.balanceETH = web3.utils.fromWei(amountInWei, 'ether')

        // Retrieve the amount of THX for account 0
        this.balanceTHX = await THXTokenInstance.methods.balanceOf(this.accounts[0]).call()
      })
    },
    async onClickMint() {
      let THXTokenInstance = new web3.eth.Contract(THXTokenJSON.abi, "0x0AA6728c7844c7a5c8fB0fd078FD6F0254FB60E8")

      // Mint 1000 THX for account 0. Make sure to call from account 0 that has the MinterRole
      await THXTokenInstance.methods.mint(this.accounts[0], 1000).send({from: this.accounts[0]})

      // Retrieve the amount of THX for account 0
      this.balanceTHX = await THXTokenInstance.methods.balanceOf(this.accounts[0]).call()
    }
  },
  mounted() {
    this.init()
  }
}
</script>
