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

      <div v-if="isManager">
        <h3>Add manager:</h3>
        <form v-on:submit="onAddManager()">
          <input v-model="newManagerAddress" type="text" placeholder="account_address">
          <button class="btn btn--default" type="submit">Add manager</button>
        </form>
      </div>

      <div v-if="isMinter">
        <h3>Add minter:</h3>
        <form v-on:submit="onAddMinter()">
          <input v-model="newMinterAddress" type="text" placeholder="account_address">
          <button class="btn btn--default" type="submit">Add minter</button>
        </form>
      </div>

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
      isManager: false,
      isMinter: false,
      balance: {
        token: 0,
        pool: 0
      },
      transferToPoolAmount: 0,
      mintForAccountAmount: 0,
      rewardSlug: "",
      rewardAmount: 0,
      newManagerAddress: "",
      newMinterAddress: ""
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
      const pool = this.network.instances.pool;

      this.balance.token = await token.methods.balanceOf(this.network.accounts[0]).call()
      this.balance.pool = await token.methods.balanceOf(this.network.addresses.pool).call()
      this.isManager = await pool.methods.isManager(this.network.accounts[0]).call()
      this.isMinter = await token.methods.isMinter(this.network.accounts[0]).call()
    },
    onMintForAccount() {
      const token = this.network.instances.token

      return token.methods.mint(this.network.accounts[0], this.mintForAccountAmount).send({from: this.network.accounts[0]}).then(async () => {

        this.balance.pool = await token.methods.balanceOf(this.network.addresses.pool).call()
        this.balance.token = await token.methods.balanceOf(this.network.accounts[0]).call()

        return this.$refs.header.updateBalance()
      })
    },
    onTransferToPool() {
      const pool = this.network.instances.pool;

      return pool.methods.deposit(this.transferToPoolAmount).send({from: this.network.accounts[0]}).then(() => {
        return this.$refs.header.updateBalance()
      })
    },
    onAddManager() {
      const pool = this.network.instances.pool;

      return pool.methods.addManager(this.newManagerAddress).send({from: this.network.accounts[0]})
    },
    onAddMinter() {
      const token = this.network.instances.token;

      return token.methods.addMinter(this.newMinterAddress).send({from: this.network.accounts[0]});
    }
  }
}
</script>
