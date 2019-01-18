<template>
  <article class="region region--container">

    <main class="region region--content">

      <h2>{{ poolName }}</h2>
      <p>Balance Pool (THX): <strong>{{ tokenBalancePool }}</strong></p>
      <ul>
        <li v-bind:key="reward.id" v-for="reward in rewards">
          <p>
            ID: <strong>{{ reward.id }}</strong><br />
            Slug: <strong>{{ reward.slug }}</strong><br />
            Beneficiary: <strong>{{ reward.beneficiary }}</strong><br />
            Amount: <strong>{{ reward.amount }}</strong><br />
            State: <strong>{{ reward.state }}</strong>
          </p>
          <p>
            <button v-on:click="rejectReward(reward.id)">Reject</button>
            <button v-on:click="approveReward(reward.id)">Approve</button>
          </p>
        </li>
      </ul>

    </main>
  </article>
</template>

<script>
/*globals web3:true*/
import Web3 from 'web3'

import TokenJSON from '../../build/contracts/THXToken.json'
import RewardPoolJSON from '../../build/contracts/RewardPool.json'

import Header from '../components/Header.vue'

export default {
  name: 'home',
  components: {
    Header
  },
  data: function () {
    return {
      poolName: "",
      providerURL: "http://localhost:8545",
      ethBalanceAccount0: 0,
      tokenBalanceAccount0: 0,
      ethBalanceAccount1: 0,
      tokenBalanceAccount1: 0,
      tokenBalancePool: 0,
      accounts: [],
      balances: [],
      rewards: [],
      tokenAddress: null,
      rewardPoolAddress: null,
      tokenInstance: null,
      RewardPoolInstance: null,
      transferToPoolAmount: 0,
      mintForAccountAmount: 0,
      rewardSlug: "",
      rewardAmount: 0
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
      console.log('Migrate your contracts first!')
    }

  },
  methods: {
    async init() {
      this.poolName = await this.rewardPoolInstance.methods.name().call();

      // Retrieve the accounts available on the network
      await web3.eth.getAccounts((error, accounts) => {
        // Store the accounts
        this.accounts = accounts
      })

      // Update the rewards.
      this.updateRewards()

      // Update the balances for account 0
      this.updateBalances()
    },
    async updateRewards() {
      this.rewards = []

      var amountOfRewards = parseInt( await this.rewardPoolInstance.methods.count().call() )

      for (var i = 0; i < amountOfRewards; i++) {
        // Display the current reward state. @TODO Should not return duplicates.
        let reward = await this.rewardPoolInstance.methods.rewards(i).call()

        this.rewards.push(reward)
      }

    },
    async createReward() {
      await this.rewardPoolInstance.methods.add(this.rewardSlug, this.rewardAmount).send({from: this.accounts[0]})

      this.updateRewards()
    },
    async approveReward(id) {
      await this.rewardPoolInstance.methods.approve(id).send({from: this.accounts[0]})

      this.updateRewards()
      this.updateBalances()
    },
    async rejectReward(id) {
      await this.rewardPoolInstance.methods.reject(id).send({from: this.accounts[0]})
      this.updateRewards()
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

      this.updateBalances()
    },
    async onTransferToPool() {
      await this.tokenInstance.methods.transfer(this.rewardPoolAddress, this.transferToPoolAmount).send({from: this.accounts[0]})

      // @TODO This deposit method still reverts...
      // await this.rewardPoolInstance.methods.deposit(this.transferToPoolAmount).send({from: this.accounts[0]})

      this.updateBalances()
    }
  }
}
</script>
