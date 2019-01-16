<template>
  <div class="home">
    <h1>Homepage</h1>
    <hr>
    <div v-for="balance in balances">
      <p>Address: <strong>{{ balance.address }}</strong></p>
      <p>Balance (ETH): <strong>{{ balance.ethBalance }}</strong></p>
      <p>Balance (THX): <strong>{{ balance.tokenBalance }}</strong></p>
    </div>
    <hr>
    <p>Address: <strong>{{ rewardPoolAddress }}</strong></p>
    <p>Balance Pool (THX): <strong>{{ tokenBalancePool }}</strong></p>
    <hr>

    <form v-on:submit="onMintForAccount()">
      <input v-model="mintForAccountAmount" type="number" min="0" /><br />
      <button type="submit">Mint {{ mintForAccountAmount }} THX for yourself</button>
    </form>

    <form v-on:submit="onTransferToPool()">
      <input v-model="transferToPoolAmount" type="number" min="0" v-if="balances[0]" v-bind:max="balances[0].tokenBalance" /><br />
      <button type="submit">Transfer {{ transferToPoolAmount }} THX to the pool</button>
    </form>

  </div>
</template>

<script>
/*globals web3:true*/
import Web3 from 'web3'

import TokenJSON from '../../build/contracts/THXToken.json'
import RewardPoolJSON from '../../build/contracts/RewardPool.json'

export default {
  name: 'home',
  data: function () {
    return {
      providerURL: "http://localhost:8545",
      ethBalanceAccount0: 0,
      tokenBalanceAccount0: 0,
      ethBalanceAccount1: 0,
      tokenBalanceAccount1: 0,
      tokenBalancePool: 0,
      accounts: [],
      balances: [],
      tokenAddress: null,
      rewardPoolAddress: null,
      tokenInstance: null,
      RewardPoolInstance: null,
      transferToPoolAmount: 0,
      mintForAccountAmount: 0
    }
  },
  mounted() {
    this.init()
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

      // Get the contract addresses
      this.tokenAddress = TokenJSON.networks[nid].address
      this.rewardPoolAddress = RewardPoolJSON.networks[nid].address

      // Create an instance from the THXToken Contract abi and contract address on the current network
      this.tokenInstance = new web3.eth.Contract(TokenJSON.abi, this.tokenAddress)
      this.rewardPoolInstance = new web3.eth.Contract(RewardPoolJSON.abi, this.rewardPoolAddress)

      // Retrieve the accounts available on the network
      await web3.eth.getAccounts((error, accounts) => {
        // Store the accounts
        this.accounts = accounts
      })

      // Update the balances for account 0
      this.updateBalances()
    },
    async updateBalances() {
      this.balances = []

      for (var account of this.accounts) {
        // Retrieve the amount of Wei for account 0
        let amountInWei = await web3.eth.getBalance(account)

        this.balances.push({
          address: account,
          // Calculate the amount of ETH from Wei
          ethBalance: web3.utils.fromWei(amountInWei, 'ether'),
          // Retrieve the amount of THX for account 0
          tokenBalance: await this.tokenInstance.methods.balanceOf(account).call()
        })
      }

      // Retrieve the amount of THX that is in the pool
      this.tokenBalancePool = await this.tokenInstance.methods.balanceOf(this.rewardPoolAddress).call()
    },
    async onMintForAccount() {
      // Mint 1000 THX for account 0. Make sure to call from account 0 that has the MinterRole
      await this.tokenInstance.methods.mint(this.accounts[0], this.mintForAccountAmount).send({from: this.accounts[0]})

      // Update the balances for account 0
      this.updateBalances()
    },
    async onTransferToPool() {
      // Mint 1000 THX for account 0. Make sure to call from account 0 that has the MinterRole
      await this.tokenInstance.methods.transfer(this.rewardPoolAddress, this.transferToPoolAmount).send({from: this.accounts[0]})

      // Update the balances for account 0
      this.updateBalances()
    }
  }
}
</script>
