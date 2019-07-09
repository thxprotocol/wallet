<template>
<div id="app" v-bind:class="`section--${$router.currentRoute.name}`">
    <router-view />
    <footer v-if="removeFooterPaths()" class="region region--navigation">
        <nav class="navbar">
            <ul class="nav">
                <li v-bind:key="route.name" v-for="route in routes">
                    <router-link v-bind:to="route.path">
                        <span v-if="route.name == 'notifications' && rewards.length > 0" class="badge badge--warning">
                            {{ rewards.length }}
                        </span>
                        <img width="20" height="20" v-bind:src="assets[route.name][(route.path == $router.currentRoute.path) ? 'active' : 'default']" alt="Wallet Icon" />
                    </router-link>
                </li>
            </ul>
        </nav>
    </footer>
</div>
</template>

<script>
import NetworkService from './services/NetworkService.js'
import NotificationService from './services/NotificationService';

/*global THX*/
window.THX = {};
THX.ns = new NetworkService();

export default {
    name: 'App',
    data: function() {
        return {
            network: null,
            rewards: [],
            assets: {
                wallet: {
                    default: require('./assets/wallet.svg'),
                    active: require('./assets/wallet_selected.svg'),
                },
                notifications: {
                    default: require('./assets/notification.svg'),
                    active: require('./assets/notification_selected.svg'),
                },
                account: {
                    default: require('./assets/account.svg'),
                    active: require('./assets/account.svg')
                },
                camera: {
                    default: require('./assets/account.svg'),
                    active: require('./assets/account.svg')
                }
            },
            approvals: [],
            lastId: -1
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
    mounted() {
        if (localStorage.lastId) {
            this.lastId = localStorage.lastId;
        }
    },
    methods: {
        async init() {
            this.checkForRewards()
            // this.update()
            const notify = new NotificationService();
        },
        removeFooterPaths() {
            return this.$router.history.current["name"] !== "reward";
        },
        async update() {
            const pool = THX.ns.instances.pool;

            const amountOfRewards = await pool.methods.countRewardsOf(THX.ns.accounts[0]).call()

            let rewards = []

            for (var i = 0; i < parseInt(amountOfRewards); i++) {
                let reward = await pool.methods.rewards(i).call()

                rewards.push(reward)
            }

            this.rewards = rewards.filter((r) => {
                return r.state == 0
            })
        },
        async checkForRewards() {
            let newRewards = await this.getNewestApprovedWithdrawals(this.lastId);

            if (newRewards !== false && typeof newRewards !== "undefined") {
                this.$router.push({
                    name: 'reward',
                    params: {
                        id: newRewards
                    }
                });
            }

            return null;
        },
        async getNewestApprovedWithdrawals(lastId) {
            const pool = THX.ns.instances.pool;
            let amountOfRewards = parseInt(await pool.methods.countRewardsOf(THX.ns.accounts[0]).call())

            // Grab all the ID's of rewards for this beneficiaries.
            for (var i = 0; i < amountOfRewards; i++) {
                let rewardId = await pool.methods.beneficiaries(THX.ns.accounts[0], i).call()
                // If the reward ID of this address is new (aka the ID is higher than the last one generated) we
                // add it to the array of items the user should see.
                if (parseInt(rewardId) > parseInt(lastId)) {
                    return rewardId;
                }
            }

            return false;
        }
    }
}
</script>

<style lang="scss">
@import './app.scss';
</style>
