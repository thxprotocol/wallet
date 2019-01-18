<template>
  <header class="region region--header">
    <div class="logo">
      <img width="50" height="50" v-bind:src="assets.logo" alt="THX Logo" />
    </div>
    <div class="account_balance">
      <p>Your balance (THX)</p>
      <p><span class="font-size-large">{{ balance.token }}</span></p>
    </div>
  </header>
</template>

<script>
/*globals web3:true*/
import Web3 from 'web3'

import TokenJSON from '../../build/contracts/THXToken.json'
import RewardPoolJSON from '../../build/contracts/RewardPool.json'
import Logo from '../assets/thx_logo.svg'

export default {
  name: 'Header',
  data: function () {
    return {
      poolName: "",
      providerURL: "http://localhost:8545",
      assets: {
        logo: Logo
      },
      accounts: [],
      balance: {
        eth: 0,
        token: 0
      },
      tokenAddress: null,
      rewardPoolAddress: null,
      tokenInstance: null,
      RewardPoolInstance: null,
    }
  },
  async mounted() {
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL))
    }

    // Get the network id
    const nid = await web3.eth.net.getId()

    if (typeof TokenJSON.networks[nid] != 'undefined' && typeof RewardPoolJSON.networks[nid] != 'undefined') {
      // Get the contract addresses
      this.tokenAddress = TokenJSON.networks[nid].address
      this.rewardPoolAddress = RewardPoolJSON.networks[nid].address

      // Create an instance from the THXToken Contract abi and contract address on the current network
      this.tokenInstance = new web3.eth.Contract(TokenJSON.abi, this.tokenAddress)
      this.rewardPoolInstance = new web3.eth.Contract(RewardPoolJSON.abi, this.rewardPoolAddress)

      this.init()
    }
    else {
      // eslint-disable-next-line
      console.log('Migrate your contracts first!')
    }

  },
  methods: {
    async init() {

      this.poolName = await this.rewardPoolInstance.methods.name().call()

      // Retrieve the accounts available on the network
      await web3.eth.getAccounts((error, accounts) => {
        // Store the accounts
        this.accounts = accounts
      })

      // Update the balances for account 0
      this.updateBalances()
    },
    async updateBalances() {
      // Retrieve the amount of Wei for account 0
      let amountInWei = await web3.eth.getBalance(this.accounts[0])

      this.balance.eth = web3.utils.fromWei(amountInWei, 'ether')
      this.balance.token = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call()
    }
  }
}
</script>
