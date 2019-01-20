<template>
  <article class="region region--container">

    <div class="list list--swipe">
      <div v-bind:key="reward.id" v-for="reward in rewards" class="notification">
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
        <div class="notification__actions">
          <button class="btn btn--default" v-on:click="reject(reward.id)">
            Reject
          </button>
          <button class="btn btn--success" v-on:click="approve(reward.id)">
            Approve
          </button>
        </div>
      </div>
    </div>

    <ul class="list list--nav">
      <li v-bind:key="r.id" v-for="r in rewards">
        <button v-bind:class="`${(r.id == currentNotification) ? 'active' : ''}`">{{ r.id }}</button>
      </li>
    </ul>

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
      rewards: [],
      currentNotification: 2
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
      const token = this.network.instances.token;

      // Get the pool information
      this.pool.name = await pool.methods.name().call()
      this.pool.balance = await token.methods.balanceOf(this.network.addresses.pool).call()

      this.update()
    },
    async update() {
      const pool = this.network.instances.pool;
      const amountOfRewards = await pool.methods.countRewards().call()
      const isManager = await pool.methods.isManager(this.network.accounts[0]).call()

      if (isManager) {
        let rewards = []

        for (var i = 0; i < parseInt(amountOfRewards); i++) {
          let reward = await pool.methods.rewards(i).call()

          rewards.push(reward)
        }

        this.rewards = rewards.filter((r) => {
          return r.state == 0
        })
      }
    },
    approve(id) {
      const pool = this.network.instances.pool;

      return pool.methods.approve(id).send({from: this.network.accounts[0]}).then(() => {
        this.update()
      })
    },
    reject(id) {
      const pool = this.network.instances.pool;

      return pool.methods.reject(id).send({from: this.network.accounts[0]}).then(() => {
        this.update()
      })
    }
  }
}
</script>
