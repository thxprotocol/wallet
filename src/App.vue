<template>
<div id="app" v-bind:class="`section--${$router.currentRoute.name}`">
    <div v-if="alert" class="alert alert--warning">
        <strong>[{{ alert.confirmations }}]</strong> {{alert.hash}} <a v-on:click="alert = null"><strong>x</strong></a>
    </div>
    <router-view />
    <footer class="region region--navigation">
        <nav class="navbar">
            <ul class="nav">
                <li v-bind:key="route.name" v-for="route in routes">
                    <router-link v-bind:to="route.path">
                        <span v-if="route.name == 'notifications' && amountOfRewards > 0" class="badge badge--warning">
                            {{ amountOfRewards }}
                        </span>
                        <img width="20" height="20" v-bind:src="assets[route.name]['default']" alt="Wallet Icon" />
                    </router-link>
                </li>
            </ul>
        </nav>
    </footer>
</div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';

import StateService from './services/StateService';
import ContractService from './services/ContractService';
import EventService from './services/EventService';
import NotificationService from './services/NotificationService';

/*global THX*/
window.THX = {};

export default {
    name: 'App',
    data: function() {
        return {
            state: new StateService(),
            alert: null,
            amountOfRewards: 0,
            assets: {
                wallet: {
                    default: require('./assets/wallet.svg')
                },
                notifications: {
                    default: require('./assets/notification.svg')
                },
                account: {
                    default: require('./assets/account.svg')
                },
                camera: {
                    default: require('./assets/qrcode.svg')
                }
            }
        }
    },
    computed: {
        routes() {
            return this.$router.options.routes.filter(item => item.visible);
        }
    },
    created() {
        THX.contracts = new ContractService();

        const uid = firebase.auth().currentUser.uid;
        const key = (typeof this.state.getItem('privateKey') !== "undefined") ? this.state.getItem('privateKey') : null;

        this.init(uid, key);
    },
    methods: {
        async init(uid, key) {
            let pool;

            await THX.contracts.load(key);

            pool = THX.contracts.instances.pool;

            this.amountOfRewards = parseInt(await pool.methods.countRewards().call());

            this.notifications = new NotificationService();
            this.ea = new EventService();

            this.ea.listen('event.RewardStateChanged', this.onRewardStateChange);
            this.ea.listen('event.RuleStateChanged', this.onRuleStateChange);
        },
        removeFooterPaths() {
            return this.$router.history.current["name"] !== "reward";
        },
        async onRewardStateChange() {
            const pool = THX.contracts.instances.pool;
            this.amountOfRewards = parseInt(await pool.methods.countRewards().call());
        },
        async onRuleStateChange() {
        }
    }
}
</script>

<style lang="scss">
@import './app.scss';
</style>
