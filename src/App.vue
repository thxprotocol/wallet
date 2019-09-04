<template>
<div id="app" v-bind:class="`section--${$router.currentRoute.name}`">
    <Header v-if="$router.currentRoute.meta.header" ref="header" />
    <router-view />
    <Footer v-if="currentUser" ref="footer" />
</div>
</template>

<script>
import firebase from 'firebase/app';

import Header from './components/Header';
import Footer from './components/Footer';
import EventService from './services/EventService';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'App',
    components: {
        Header,
        Footer
    },
    data: function() {
        return {
            events: new EventService(),
            currentUser: null,
        }
    },
    created() {
        this.events.listen('event.Deposited', this.onPoolDeposit);
        this.events.listen('event.Withdrawn', this.onPoolWithdrawel);

        this.currentUser = firebase.auth().currentUser;
    },
    methods: {
        toast(title, body, variant) {
            return this.$bvToast.toast(body, {
                title: title,
                toaster: 'b-toaster-bottom-full',
                autoHideDelay: 3000,
                appendToast: true,
                variant: variant,
            })
        },
        onPoolDeposit(data) {
            const timestamp = parseInt(data.detail.created);
            const time = this.$moment(timestamp).format("MMMM Do YYYY, HH:mm");
            const amount = parseInt(new BN(data.detail.amount).div(tokenMultiplier))

            return this.toast('New pool deposit!', `${amount} THX deposited by ${data.detail.created} at ${time}.`, 'info');
        },
        onPoolWithdrawel(data) {
            const timestamp = parseInt(data.detail.created);
            const time = this.$moment(timestamp).format("MMMM Do YYYY, HH:mm");
            const amount = parseInt(new BN(data.detail.amount).div(tokenMultiplier))

            return this.toast('New pool withdrawel!', `${amount} THX withdrawn by ${data.detail.created} at ${time}.`, 'info');
        }
    }
}
</script>
