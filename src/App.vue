<template>
  <div id="app" v-bind:class="`section--${$router.currentRoute.name}`">
    <router-view/>
    <footer v-if="removeFooterPaths()" class="region region--navigation">
      <nav class="navbar">
        <ul class="nav">
          <li v-bind:key="route.name" v-for="route in $router.options.routes" v-if="route.visible">
            <router-link v-bind:to="route.path">
              <span v-if="route.name == 'notifications' && rewards.length > 0" class="badge badge--warning">
                {{ rewards.length }}
              </span>
              <img width="20" height="20" v-bind:src="assets[route.name][(route.path == $router.currentRoute.path) ? 'active' : 'default']" alt="Wallet Icon" />
            </router-link>
          </li>
        </ul>
      </nav>
    </footer>
  </div>
</template>

<script>
import NetworkService from './services/NetworkService.js'
import WalletSrc from './assets/wallet.svg'
import WalletActiveSrc from './assets/wallet_selected.svg'
import NotificationsSrc from './assets/notification.svg'
import NotificationsActiveSrc from './assets/notification_selected.svg'
import AccountSrc from './assets/account.svg'

export default {
  name: 'App',
  data: function () {
    return {
      network: null,
      rewards: [],
      assets: {
        wallet: {
          default: WalletSrc,
          active: WalletActiveSrc
        },
        notifications: {
          default: NotificationsSrc,
          active: NotificationsActiveSrc
        },
        account: {
          default: AccountSrc,
          active: AccountSrc
        }
      },
      approvals: [],
      lastId: 0
    }
  },
  created() {
    new NetworkService().connect().then(async (network) => {
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
      this.checkForRewards()
      this.update()
    },
    removeFooterPaths() {
      return this.$router.history.current["name"] !== "reward";
    },
    async update() {
      const pool = this.network.instances.pool;

      const amountOfRewards = await pool.methods.countRewardsOf(this.network.accounts[0]).call()

      let rewards = []

      for (var i = 0; i < parseInt(amountOfRewards); i++) {
        let reward = await pool.methods.rewards(i).call()

        rewards.push(reward)
      }

      this.rewards = rewards.filter((r) => {
        return r.state == 0
      })
    },
    async checkForRewards() {
      let newRewards = await this.getNewestApprovedWithdrawals(this.lastId);

      if (newRewards === true) {
        this.$router.push('Reward');
      }

      return null;
    },
    async getNewestApprovedWithdrawals(lastId) {
      const pool = this.network.instances.pool;
      let amountOfRewards = parseInt( await pool.methods.countRewardsOf(this.network.accounts[0]).call() )

      // Grab all the ID's of rewards for this beneficiaries.
      for (var i = 0; i < amountOfRewards; i++) {
        let rewardId = await pool.methods.beneficiaries(this.network.accounts[0], i).call()
        // If the reward ID of this address is new (aka the ID is higher than the last one generated) we
        // add it to the array of items the user should see.
        if (parseInt(rewardId) > parseInt(lastId)) {
          return true;
        }
      }

      return false;
    }
  }
}
</script>

<style lang="scss">
@import './app.scss';
</style>
