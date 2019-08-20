<template>
<footer class="region region--navigation">
    <nav class="navbar">
        <ul class="nav">
            <li v-bind:key="route.name" v-for="route in routes">
                <router-link v-bind:to="route.path">
                    <span v-if="route.name == 'notifications' && amountOfNewRewards > 0" class="badge badge--warning">
                        {{ amountOfNewRewards }}
                    </span>
                    <img width="20" height="20" v-bind:src="assets[route.name]" alt="Icon" />
                    <!-- {{route.name}} -->
                </router-link>
            </li>
        </ul>
    </nav>
</footer>
</template>

<script>
import EventAggregator from '../services/EventAggregator';

export default {
    name: 'App',
    computed: {
        routes() {
            return this.$router.options.routes.filter(item => item.visible);
        }
    },
    data: function() {
        return {
            ea: new EventAggregator(),
            amountOfNewRewards: 0,
            assets: {
                wallet: require('../assets/wallet.svg'),
                notifications: require('../assets/notification.svg'),
                account: require('../assets/account.svg'),
                camera: require('../assets/qrcode.svg'),
                pools: require('../assets/community.svg'),
            }
        }
    },
    created() {
        // const THX = window.THX;

        // if (firebase.auth().currentUser) {
        //     const uid = firebase.auth().currentUser.uid;
        //     const loomKey = (typeof THX.state.loomPrivateKey !== "undefined") ? THX.state.loomPrivateKey : null;
        //     const ethKey = (typeof THX.state.ethPrivateKey !== "undefined") ? THX.state.ethPrivateKey : null;
        //
        //     this.init(uid, loomKey, ethKey);
        // }
    },
    methods: {
        async init() {
            // firebase.database().ref(`users/${uid}/pools`).once('value').then(async s => {
            //     const pools = s.val();
            //
            //     for (let address in pools) {
            //         const pool = await THX.network.poolInstance(p);
            //         debugger
            //         // Start counting the pending reward polls here
            //     }
            // })

            this.ea.listen('event.RewardStateChanged', this.onRewardStateChange);
            this.ea.listen('event.RuleStateChanged', this.onRuleStateChange);
            this.ea.listen('event.clearNotifications', this.clearNotifications);
        },
        async clearNotifications() {
            // const pool = THX.network.instances.pool;
            // const amountOfRewards = parseInt(await pool.methods.countRewards().call());
            //
            // THX.state.setItem('lastRewardId', amountOfRewards);
        },
        async onRewardStateChange() {
            // const pool = THX.network.poolInstance();
            // const prevAmountOfRewards = parseInt(this.state.lastRewardId);
            // const currentAmountOfRewards = parseInt(await pool.methods.countRewards().call());
            //
            // this.amountOfNewRewards = currentAmountOfRewards - prevAmountOfRewards;
        },
        async onRuleStateChange() {
        }
    }
}
</script>
