<template>
  <article class="region region--container">
    <Header ref="header"/>
    <main class="region region--content">

        <h3>Submit private key:</h3>
        <form v-on:submit="onCreateAccountFromPrivateKey()">
          <input v-model="privateKey" type="text" placeholder="privateKey">
          <button class="btn btn--default" type="submit">Create account</button>
        </form>

        <h3>Transfer Ether:</h3>
        <form>
          <input v-model="transferEtherAddress" type="text" placeholder="account_address" />
          <input v-model="transferEtherAmount" type="number" min="0" />
          <p style="overflow:hidden; display: block; text-overflow: ellipsis;" ><strong>TX Hash: </strong> <span v-html="transactionHash"></span></p>
          <button class="btn btn--default" v-on:click="onTransferEtherMetamask()">Transfer {{ transferEtherAmount }} ETH</button>
          <button class="btn btn--default" v-on:click="onTransferEtherWithoutMetamask()">Transfer {{ transferEtherAmount }} ETH  (No MetaMask)</button>
        </form>

      <h3>Transfer Tokens:</h3>
      <form v-on:submit="onTransferTokens()">
        <input v-model="transferTokensAddress" type="text" placeholder="account_address" />
        <input v-model="transferTokensAmount" type="number" min="0" v-bind:max="balance.token" />
        <button class="btn btn--default" type="submit">Transfer {{ transferTokensAmount }} THX</button>
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
        <h3>Mint tokens:</h3>
        <form v-on:submit="onMintForAccount()">
          <input v-model="mintForAccountAmount" type="number" min="0"/>
          <button class="btn btn--default" type="submit">Mint {{ mintForAccountAmount }} THX</button>
        </form>

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
      newMinterAddress: "",
      transferTokensAddress: "",
      transferTokensAmount: 0,
      transferEtherAddress: "",
      transferEtherAmount: 0,
      transactionHash: "",
      privateKey: (typeof localStorage.privateKey != "undefined") ? localStorage.privateKey : null,
      networkService: new NetworkService()
    }
  },
  created() {
    this.networkService.connect().then(async (network) => {
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
    onCreateAccountFromPrivateKey() {
        this.networkService.privateKeyToAccount(this.privateKey)
        this.networkService.connect().then(async (network) => {
          this.network = network
          this.init()
          alert('Your account is created!')
        })
    },
    async onTransferEtherMetamask() {
        const web3 = this.networkService.web3
        const tx = {
            to: this.transferEtherAddress,
            from: this.network.accounts[0],
            value: web3.utils.toHex(web3.utils.toWei(this.transferEtherAmount, "ether"))
        }
        const receipt = await web3.eth.sendTransaction(tx)
        this.transactionHash = receipt.transactionHash
        this.$refs.header.updateBalance()
    },
    async onTransferEtherWithoutMetamask() {
        const signedTx = await this.networkService.signTransaction(this.transferEtherAddress, this.transferEtherAmount)
        const receipt = await this.networkService.sendSignedTransaction(signedTx)
        this.transactionHash = receipt.transactionHash
        this.$refs.header.updateBalance()
    },
    onTransferTokens() {
      const token = this.network.instances.token;

      return token.methods.transfer(this.transferTokensAddress, this.transferTokensAmount).send({from: this.network.accounts[0]}).then(async () => {
        return this.$refs.header.updateBalance()
      })
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
