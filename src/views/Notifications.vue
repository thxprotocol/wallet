<template>
  <article class="region region--container">

    <div class="list list--swipe">
      <div v-bind:key="reward.id" v-for="reward in rewards" v-if="reward.state == 0" class="notification">
        <h2 class="font-size-large">{{ reward.slug }}</h2>
        <p>{{ pool.name }} <strong>{{ pool.balance }} THX</strong></p>
        <hr />
        <p>
          Amount:<br>
          <strong>{{ reward.amount }}</strong> THX
        </p>
        <hr class="dotted" />
        <p>
          To:<br>
          <span class="badge badge--default">{{ reward.beneficiary }}</span>
        </p>
        <p>
          <small>State: <strong>{{ reward.state }}</strong></small>
        </p>
        <div class="notification__actions">
          <button class="btn btn--default" v-on:click="rejectReward(reward.id)">
            Reject
          </button>
          <button class="btn btn--success" v-on:click="approveReward(reward.id)">
            Approve
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import NetworkService from '../services/NetworkService.js'

export default {
  name: 'home',
  data: function () {
    return {
      network: null,
      pool: {
        name: "",
        balance: 0
      },
      rewards: []
    }
  },
  created() {

  },
  mounted() {
    new NetworkService(web3).connect().then((network) => {
      this.network = network
      this.init()
    })
  },
  methods: {
    async init() {
      const pool = this.network.instances.pool;
      const token = this.network.instances.token;

      // Get the pool information
      this.pool.name = await pool.methods.name().call()
      this.pool.balance = await token.methods.balanceOf(this.network.addresses.pool).call()

      this.updateRewards()
    },
    async updateRewards() {
      const pool = this.network.instances.pool;

      this.rewards = []

      var amountOfRewards = parseInt( await pool.methods.count().call() )

      for (var i = 0; i < amountOfRewards; i++) {
        // Display the current reward state. @TODO Should not return duplicates.
        let reward = await pool.methods.rewards(i).call()

        this.rewards.push(reward)
      }
    },
    approveReward(id) {
      const pool = this.network.instances.pool;

      return pool.methods.approve(id).send({from: this.network.accounts[0]}).then(this.updateRewards())
    },
    rejectReward(id) {
      const pool = this.network.instances.pool;

      return pool.methods.reject(id).send({from: this.network.accounts[0]}).then(this.updateRewards())
    }
  }
}
</script>
