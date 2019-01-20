<template>
  <article class="region region--container">
    <Header />
    <main class="region region--content">
      <ul class="list list--dotted" v-if="transactions">
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
      transactions: []
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

      let transactions = []
      let amountOfTransactions = parseInt( await pool.methods.countMyTransactions().call() )

      for (var i = 0; i < amountOfTransactions; i++) {
        let tx = await pool.methods.transactions(this.network.accounts[0], i).call()

        transactions.push(tx)
      }

      return transactions.reverse()
    }
  }
}
</script>
