<template>
<footer class="region region-navigation">
    <b-nav fill>
        <b-nav-item v-bind:key="route.name" v-for="route in routes" v-bind:to="route.path">
            <span v-if="route.name == 'notifications' && amountOfNewRewards > 0" class="badge badge--warning">
                {{ amountOfNewRewards }}
            </span>
            <img width="20" height="20" v-bind:src="assets[route.name]" alt="Icon" />
            <!-- {{route.name}} -->
        </b-nav-item>
    </b-nav>
</footer>
</template>

<script>
import EventAggregator from '../services/EventAggregator';
import { BNav, BNavItem } from 'bootstrap-vue';

export default {
    name: 'App',
    components: {
        'b-nav': BNav,
        'b-nav-item': BNavItem,
    },
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
        const THX = window.THX;

        if (THX.network.hasKeys) {
            this.init();
        }
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
