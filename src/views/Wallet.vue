<template>
  <article class="region region--container">
    <Header />
    <main class="region region--content">
      <ul class="list list--dotted">
        <li v-bind:key="tx.id" v-for="tx in transactions">
          {{ pool.name }}
          <strong>
            <span>{{ (tx.receiver == network.accounts[0]) ? '+' : '-' }}</span>
             {{ tx.amount }}
          </strong>
        </li>
      </ul>
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
      pool: {
        name: "",
        balance: 0
      },
      transactions: [],
    }
  },
  created() {
    new NetworkService().connect().then((network) => {
      this.network = network
      this.init()
    })
  },
  methods: {
    async init() {
      const pool = this.network.instances.pool;
      this.pool.name = await pool.methods.name().call()
      this.transactions = await this.getTransactions()
    },
    async getTransactions() {
      const pool = this.network.instances.pool;

      let refs = []
      let transactions = []

      let amountOfDeposits = parseInt( await pool.methods.countDepositsOf(this.network.accounts[0]).call() )
      let amountOfWithdrawels = parseInt( await pool.methods.countWithdrawelsOf(this.network.accounts[0]).call() )

      for (let i = 0; i < amountOfDeposits; i++) {
        let ref = await pool.methods.deposits(this.network.accounts[0], i).call()

        refs.push(ref)
      }

      for (let i = 0; i < amountOfWithdrawels; i++) {
        let ref = await pool.methods.withdrawels(this.network.accounts[0], i).call()

        refs.push(ref)
      }

      for (let i = 0; i < refs.length; i++) {
        // console.log(refs[i])
        let tx = await pool.methods.transactions(refs[i]).call()

        transactions.push(tx)
      }

      return transactions.sort()
    }
  }
}
</script>
