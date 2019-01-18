import Vue from 'vue'
import Router from 'vue-router'

import Wallet from './views/Wallet.vue'
import Notifications from './views/Notifications.vue'
import Account from './views/Account.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'wallet',
      component: Wallet,
      visible: true
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notifications,
      visible: true
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
      visible: true
    }
  ]
})
