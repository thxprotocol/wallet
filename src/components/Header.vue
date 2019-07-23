<template>
<header class="region region--header">
    <div class="logo">
        <img width="50" height="50" v-bind:src="assets.logo" alt="THX Logo" />
    </div>
    <div class="account_balance">
        <p>Your balances</p>
        <p><span class="font-size-large">{{balance.token}} THX</span></p>
        <p><span>{{balance.eth}} ETH</span></p>
    </div>
</header>
</template>

<script>
import Logo from '../assets/thx_logo.svg'
import EventService from '../services/EventService';

const THX = window.THX;

export default {
    name: 'Header',
    data: function() {
        return {
            network: null,
            assets: {
                logo: Logo
            },
            balance: {
                eth: 0,
                token: 0
            },
            ea: new EventService(),
        }
    },
    methods: {
        async updateBalance() {
            const token = THX.contracts.instances.token;
            this.balance.token = await token.methods.balanceOf(THX.contracts.currentUserAddress).call()
        }
    }
}
</script>
