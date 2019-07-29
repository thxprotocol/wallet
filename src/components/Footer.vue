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
import firebase from 'firebase/app';
import 'firebase/database';

import StateService from '../services/StateService';
import EventService from '../services/EventService';
import NotificationService from '../services/NotificationService';

export default {
    name: 'App',
    computed: {
        routes() {
            return this.$router.options.routes.filter(item => item.visible);
        }
    },
    data: function() {
        return {
            ea: new EventService(),
            state: new StateService(),
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
        const uid = firebase.auth().currentUser.uid;
        const key = (typeof this.state.getItem('privateKey') !== "undefined") ? this.state.getItem('privateKey') : null;

        this.init(uid, key);
    },
    methods: {
        async init(uid, key) {
            const THX = window.THX;
            let pool;

            await THX.contracts.load(key);

            pool = THX.contracts.instances.pool;

            const amountOfRewards = parseInt(await pool.methods.countRewards().call());
            this.state.setItem('lastRewardId', amountOfRewards);

            this.notifications = new NotificationService();
            this.ea = new EventService();

            this.ea.listen('event.RewardStateChanged', this.onRewardStateChange);
            this.ea.listen('event.RuleStateChanged', this.onRuleStateChange);
            this.ea.listen('event.clearNotifications', this.clearNotifications);
        },
        async clearNotifications() {
            const THX = window.THX;
            const pool = THX.contracts.instances.pool;
            const amountOfRewards = parseInt(await pool.methods.countRewards().call());

            this.state.setItem('lastRewardId', amountOfRewards);
            this.onRewardStateChange();
        },
        async onRewardStateChange() {
            const THX = window.THX;
            const pool = THX.contracts.instances.pool;
            const prevAmountOfRewards = parseInt(this.state.getItem('lastRewardId'));
            const currentAmountOfRewards = parseInt(await pool.methods.countRewards().call());

            this.amountOfNewRewards = currentAmountOfRewards - prevAmountOfRewards;

        },
        async onRuleStateChange() {
        }
    }
}
</script>
