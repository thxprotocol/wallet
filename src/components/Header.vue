<template>
<header class="region region--header">
    <a href="/#/account" class="link-settings">
        <img src="../assets/menu.svg" alt="Menu icon" />
    </a>
    <div class="account_balance">
        <p><span class="font-size-large">{{balance.loomTokens}} THX</span></p>
        <p><span>{{balance.ethTokens}} THX</span> | <span>{{balance.eth}} ETH</span></p>
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
                ethTokens: 0,
                loomTokens: 0,
            },
            ea: new EventService(),
        }
    },
    created() {

    },
    methods: {
        async updateBalance() {
            const THX = window.THX;
            const token = THX.contracts.instances.token;
            const tokenRinkeby = THX.contracts.instances.tokenRinkeby;
            const web3 = THX.contracts.ethWeb3;
            let balanceInWei;

            balanceInWei = await token.methods.balanceOf(THX.contracts.loomAddress).call();
            this.balance.loomTokens = web3.utils.fromWei(balanceInWei, "ether");

            balanceInWei = await tokenRinkeby.methods.balanceOf(THX.contracts.ethAddress).call();
            console.log(balanceInWei)
            this.balance.ethTokens = web3.utils.fromWei(balanceInWei, "ether");
            console.log(this.balance.ethTokens)
            balanceInWei = await web3.eth.getBalance(THX.contracts.ethAddress);
            this.balance.eth = web3.utils.fromWei(balanceInWei, "ether");
        }
    }
}
</script>
