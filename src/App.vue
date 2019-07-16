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
import NetworkService from './services/NetworkService';
import EventService from './services/EventService';
import NotificationService from './services/NotificationService';

/*global THX*/
window.THX = {};
THX.ns = new NetworkService();

export default {
    name: 'App',
    data: function() {
        return {
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
        THX.ns.connect().then(() => this.init());
    },
    methods: {
        async init() {
            const pool = THX.ns.instances.pool;
            this.amountOfRewards = parseInt(await pool.methods.countRewards().call());

            THX.notify = new NotificationService();

            this.ea = new EventService();
            this.ea.listen('event.RewardStateChanged', this.onRewardStateChange);
            this.ea.listen('event.RuleStateChanged', this.onRuleStateChange);
            this.ea.listen('tx.confirmation', this.onConfirmation);
        },
        removeFooterPaths() {
            return this.$router.history.current["name"] !== "reward";
        },
        onConfirmation(data) {
            this.alert = {
                hash: data.detail.hash,
                confirmations: data.detail.confirmations,
            }
        },
        async onRewardStateChange() {
            const pool = THX.ns.instances.pool;
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
