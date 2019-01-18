<template>
  <article class="region region--container">
    <Header />
    <main class="region region--content">
      <ul class="list list--dotted" v-if="transactions">
        <li v-bind:key="tx.id" v-for="tx in transactions">
          {{ pool.name }} <strong>+ {{ tx.amount }}</strong>
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
  async mounted() {
    new NetworkService(web3).connect().then((network) => {
      this.network = network
      this.init()
    })
  },
  methods: {
    async init() {
      const pool = this.network.instances.pool;

      this.pool.name = await pool.methods.name().call()
      this.getTX()
    },
    async getTX() {
      const pool = this.network.instances.pool;

      let transactions = []
      let amountOfRewards = parseInt( await pool.methods.count().call() )

      for (var i = 0; i < amountOfRewards; i++) {
        let tx = await pool.methods.rewards(i).call()

        transactions.push(tx)
      }

      // @TODO Also implement Pool deposits here
      // ...

      this.transactions = transactions.reverse()
    }
  }
}
</script>
