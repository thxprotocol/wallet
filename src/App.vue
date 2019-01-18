<template>
  <div id="app" v-bind:class="`section--${$router.currentRoute.name}`">
    <router-view/>
    <footer class="region region--navigation">
      <nav class="navbar">
        <ul class="nav">
          <li v-for="route in $router.options.routes" v-if="route.visible">
            <router-link v-bind:to="route.path">
              <img width="20" height="20" v-bind:src="assets[route.name][(route.path == $router.currentRoute.path) ? 'active' : 'default']" alt="Wallet Icon" />
            </router-link>
          </li>
        </ul>
      </nav>
    </footer>
  </div>
</template>

<script>
/*globals web3:true*/
import Web3 from 'web3'

import WalletSrc from './assets/wallet.svg'
import WalletActiveSrc from './assets/wallet_selected.svg'
import NotificationsSrc from './assets/notification.svg'
import NotificationsActiveSrc from './assets/notification_selected.svg'
import AccountSrc from './assets/account.svg'

export default {
  name: 'App',
  data: function () {
    return {
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
      }
    }
  },
  mounted() {

  }

}
</script>

<style lang="scss">
@import './app.scss';
</style>
