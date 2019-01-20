<template>
  <article class="region region--container">
    <button v-on:click="close()" class="btn btn--close">Close</button>

    <div class="list list--swipe" v-if="rewards">
      <div class="splash">
        <img width="100%" height="auto" v-bind:src="assets.stars" alt="Flash Page Stars" />
        <h1 class="font-size-xl">+ {{ reward.amount }}</h1>
        <p><strong class="font-size-large">THX</strong></p>
        <hr />
        <p>{{ pool.name }}</p>
        <p>for<br/>
        <strong>{{ reward.slug }}</strong></p>
      </div>
    </div>

    <ul class="list list--nav">
      <li v-bind:key="r.id" v-for="r in rewards">
        <button v-on:click="navigateToReward(r.id)" v-bind:class="`${(r.id == currentReward) ? 'active' : ''}`">{{ r.id }}</button>
      </li>
    </ul>

  </article>
</template>

<script>
import NetworkService from '../services/NetworkService.js'
import StarsSrc from '../assets/flash_page_stars.svg'

export default {
  name: 'reward',
  data: function () {
    return {
      network: null,
      assets: {
        stars: StarsSrc
      },
      pool: {
        name: "",
      },
      reward: {},
      rewards: [],
      currentReward: this.$route.params.id,
      lastId: -1
    }
  },
  created() {
    new NetworkService().connect().then((network) => {
      this.network = network
      this.init()
    })
  },
  mounted() {
    if (localStorage.lastId) {
      this.lastId = localStorage.lastId;
    }
  },
  methods: {
    async init() {
      const pool = this.network.instances.pool;
      this.pool.name = await pool.methods.name().call()
      this.reward = await this.getReward(this.$route.params.id)
      this.currentReward = this.$route.params.id
      this.rewards = await this.getRewardList(this.lastId)
    },
    async getReward(rewardId) {
      const pool = this.network.instances.pool
      let loadedReward = await pool.methods.rewards(rewardId).call()

      let reward = [];
      // Get current reward data from URL.
      if (typeof loadedReward !== 'undefined') {
        reward.amount = loadedReward.amount;
        reward.slug = loadedReward.slug;

        // Check if we have new items to show in our reward screen.
        if (typeof lastSeen !== 'undefined') {
          localStorage.setItem('lastId', loadedReward.id);
        }

        return reward;
      }

      return []
    },
    close() {
      this.$router.push('/');
    },
    navigateToReward(rewardId) {
      this.$router.push({name: 'reward', params: { id: rewardId}});
    },
    async getRewardList(lastId) {
      const pool = this.network.instances.pool
      let amountOfRewards = parseInt( await pool.methods.countRewardsOf(this.network.accounts[0]).call() )
      let rewardIds = []

      // Grab all the ID's of rewards for this beneficiaries.
      for (var i = 0; i < amountOfRewards; i++) {
        let rewardId = await pool.methods.beneficiaries(this.network.accounts[0], i).call()
        // If the reward ID of this address is new (aka the ID is higher than the last one generated) we
        // add it to the array of items the user should see.
        if (parseInt(rewardId) > parseInt(lastId)) {
          rewardIds.push({'id': rewardId})
        }
      }

      return rewardIds;
      //
      // let rewardsCount = rewardIds.length;
      // let rewards = []
      //
      // // Generate an array of data to be used in the markup.
      // for (var key = 0; key < rewardsCount; key++) {
      //   let rwrd = await pool.methods.rewards(rewardIds[key]).call()
      //   rewards.push(rwrd);
      // }
      //
      // // Return the slugs of all the approved withdrawals the user got tokens for.
      // return rewards;
    },
  }
}
</script>
