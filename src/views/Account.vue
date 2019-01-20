<template>
  <article class="region region--container">
    <Header ref="header"/>
    <main class="region region--content">

      <h3>Mint tokens:</h3>
      <form v-on:submit="onMintForAccount()">
        <input v-model="mintForAccountAmount" type="number" min="0"/>
        <button class="btn btn--default" type="submit">Mint {{ mintForAccountAmount }} THX</button>
      </form>

      <h3>Pool deposit:</h3>
      <form v-on:submit="onTransferToPool()">
        <input v-model="transferToPoolAmount" type="number" min="0" v-bind:max="balance.token" />
        <button class="btn btn--default" type="submit">Deposit {{ transferToPoolAmount }} THX</button>
      </form>

      <h3>Submit reward:</h3>
      <form v-on:submit="submitReward()">
        <input v-model="rewardSlug" type="text" placeholder="reward_type" />
        <input v-model="rewardAmount" type="number" min="0" v-bind:max="balance.pool" />
        <button class="btn btn--default" type="submit">Submit Reward!</button>
      </form>

    </main>
  </article>
</template>

<script>
import NetworkService from '../services/NetworkService.js'
import Header from '../components/Header.vue'

export default {
  name: 'home',
  components: {
    Header
  },
  data: function () {
    return {
      network: null,
      balance: {
        token: 0,
        pool: 0
      },
      transferToPoolAmount: 0,
      mintForAccountAmount: 0,
      rewardSlug: "",
      rewardAmount: 0
    }
  },
  created() {
    new NetworkService().connect().then(async (network) => {
      this.network = network
      this.init()
    })
  },
  methods: {
    async init() {
      const token = this.network.instances.token

      this.balance.token = await token.methods.balanceOf(this.network.accounts[0]).call()
      this.balance.pool = await token.methods.balanceOf(this.network.addresses.pool).call()
    },
    onMintForAccount() {
      const token = this.network.instances.token

      // Mint 1000 THX for account 0. Make sure to call from account 0 that has the MinterRole
      return token.methods.mint(this.network.accounts[0], this.mintForAccountAmount).send({from: this.network.accounts[0]}).then(() => {
        return this.$refs.header.updateBalance()
      })
    },
    onTransferToPool() {
      const pool = this.network.instances.pool;

      return pool.methods.deposit(this.transferToPoolAmount).send({from: this.network.accounts[0]}).then(() => {
        return this.$refs.header.updateBalance()
      })

      // const token = this.network.instances.token;
      // return token.methods.transfer(this.network.addresses.pool, this.transferToPoolAmount).send({from: this.network.accounts[0]}).then(() => {
      //   return this.$refs.header.updateBalance()
      // })
    },
    submitReward() {
      const pool = this.network.instances.pool;

      return pool.methods.add(this.rewardSlug, this.rewardAmount).send({from: this.network.accounts[0]})
    },
  }
}
</script>
