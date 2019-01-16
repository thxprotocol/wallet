<template>
  <div class="home">
    <h1>Homepage</h1>
    <hr>
    <p>Address: <strong>{{ accounts[0] }}</strong></p>
    <p>Balance Account (ETH): <strong>{{ ethBalanceAccount }}</strong></p>
    <p>Balance Account (THX): <strong>{{ tokenBalanceAccount }}</strong></p>
    <hr>
    <p>Address: <strong>{{ escrowAddress }}</strong></p>
    <p>Balance Pool (THX): <strong>{{ tokenBalancePool }}</strong></p>
    <hr>

    <form v-on:submit="onMintForAccount()">
      <input v-model="mintForAccountAmount" type="number" min="0" /><br />
      <button type="submit">Mint {{ mintForAccountAmount }} THX for yourself</button>
    </form>

    <form v-on:submit="onTransferToPool()">
      <input v-model="transferToPoolAmount" type="number" min="0" /><br />
      <button type="submit">Transfer {{ transferToPoolAmount }} THX to the pool</button>
    </form>

  </div>
</template>

<script>
/*globals web3:true*/
import Web3 from 'web3'

import TokenJSON from '../../build/contracts/THXToken.json'
import EscrowJSON from '../../build/contracts/Escrow.json'

export default {
  name: 'home',
  data: function () {
    return {
      providerURL: "http://localhost:8545",
      ethBalanceAccount: 0,
      tokenBalanceAccount: 0,
      tokenBalancePool: 0,
      accounts: [],
      tokenAddress: null,
      escrowAddress: null,
      tokenInstance: null,
      escrowInstance: null,
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
      this.escrowAddress = EscrowJSON.networks[nid].address

      // Create an instance from the THXToken Contract abi and contract address on the current network
      this.tokenInstance = new web3.eth.Contract(TokenJSON.abi, this.tokenAddress)
      this.escrowInstance = new web3.eth.Contract(EscrowJSON.abi, this.escrowAddress)

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
      this.ethBalanceAccount = web3.utils.fromWei(amountInWei, 'ether')

      // Retrieve the amount of THX for account 0
      this.tokenBalanceAccount = await this.tokenInstance.methods.balanceOf(account).call()

      // Retrieve the amount of THX that is in the pool
      this.tokenBalancePool = await this.tokenInstance.methods.balanceOf(this.escrowAddress).call()
    },
    async onMintForAccount() {
      // Mint 1000 THX for account 0. Make sure to call from account 0 that has the MinterRole
      await this.tokenInstance.methods.mint(this.accounts[0], this.mintForAccountAmount).send({from: this.accounts[0]})

      // Update the balances for account 0
      this.updateBalances(this.accounts[0])
    },
    async onTransferToPool() {
      // Mint 1000 THX for account 0. Make sure to call from account 0 that has the MinterRole
      await this.tokenInstance.methods.mint(this.escrowAddress, this.transferToPoolAmount).send({from: this.accounts[0]})

      // Update the balances for account 0
      this.updateBalances(this.accounts[0])
    }
  }
}
</script>
