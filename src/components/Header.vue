<template>
<header class="region region--header">
    <a href="/#/account" class="link-settings">
        <img src="../assets/menu.svg" alt="Menu icon" />
    </a>
    <div class="account_balance">
        <p><span class="font-size-large">{{balance.token}} THX</span></p>
        <p><span>{{balance.eth}} ETH</span></p>
    </div>
</header>
</template>

<script>
import Logo from '../assets/thx_logo.svg'
import EventService from '../services/EventService';

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
            const THX = window.THX;
            const token = THX.contracts.instances.token;
            this.balance.token = await token.methods.balanceOf(THX.contracts.currentUserAddress).call()
        }
    }
}
</script>
