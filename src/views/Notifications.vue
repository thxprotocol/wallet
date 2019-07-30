<template>
<article class="region region--container">

    <div class="list list--swipe">
        <div v-bind:key="n.id" v-for="n in notifications" class="notification">
            <template v-if="n.beneficiary">
                <h2 class="font-size-large">
                    {{ n.title }}
                    <span class="badge badge--default">{{ n.state }}</span>
                </h2>
                <p>{{ n.description }}</p>
                <p>{{ pool.name }} <strong>{{ pool.balance }} THX</strong></p>
                <hr />
                <p>
                    Amount:<br>
                    <strong>{{ n.amount }}</strong> THX
                </p>
                <hr class="dotted" />
                <p>
                    To: <span class="badge badge--default">{{ n.beneficiary }}</span>
                </p>
                <p>
                    Time: {{ n.created }}
                </p>
                <div class="notification__actions">
                    <button v-bind:class="{ disabled: rejectBusy }" class="btn btn--default" v-on:click="rejectReward(n.id)">
                        Reject
                    </button>
                    <button v-bind:class="{ disabled: approveBusy }" class="btn btn--success" v-on:click="approveReward(n.id)">
                        Approve
                    </button>
                </div>
            </template>
        </div>
    </div>

    <ul class="list list--nav">
        <li v-bind:key="n.id" v-for="n in notifications">
            <button v-bind:class="{ active: (n.id == currentNotification) }">{{ n.id }}</button>
        </li>
    </ul>

</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';

import EventService from '../services/EventService';
import StateService from '../services/StateService.js';

const THX = window.THX;

export default {
    name: 'home',
    data: function() {
        return {
            ea: new EventService(),
            state: new StateService(),
            network: null,
            pool: {
                name: "",
                balance: 0
            },
            notifications: [],
            currentNotification: 0,
            approveBusy: false,
            rejectBusy: false,
        }
    },
    created() {
        const uid = firebase.auth().currentUser.uid;
        const loomKey = (typeof this.state.getItem('loomPrivateKey') !== "undefined") ? this.state.getItem('loomPrivateKey') : null;
        const ethKey = (typeof this.state.getItem('ethPrivateKey') !== "undefined") ? this.state.getItem('ethPrivateKey') : null;

        if (loomKey && ethKey) this.init(uid, loomKey, ethKey);
    },
    mounted() {
        this.ea.dispatch('event.clearNotifications')
    },
    methods: {
        async init(uid, loomKey, ethKey) {
            let token, pool, balanceInWei, web3;

            await THX.contracts.load(loomKey, ethKey);

            web3 = THX.contracts.ethWeb3;
            pool = THX.contracts.instances.pool;
            token = THX.contracts.instances.token;

            this.pool.name = await pool.methods.name().call();

            balanceInWei = await token.methods.balanceOf(pool._address).call()
            this.pool.balance = web3.utils.fromWei(balanceInWei, "ether");

            this.update()

            this.ea.listen('event.RewardStateChanged', this.handleRewardStateChange);
        },
        handleRewardStateChange() {
            return this.update();
        },
        async update() {
            const rewards = await this.getPendingRewards();

            this.notifications = rewards;
        },
        async formatReward(data) {
            const dateTime = new Date(parseInt(data.created));
            const amount = parseInt(data.amount);
            const beneficiary = data.beneficiary.toLowerCase();
            const wallet = await firebase.database().ref('wallets').child(beneficiary).once('value');
            const user = await firebase.database().ref('users').child( wallet.val().uid ).once('value');
            const rule = await firebase.database().ref('rules').child( data.key ).once('value');

            return {
                id: parseInt(data.id),
                title: rule.val().title,
                description: rule.val().description,
                beneficiary: user.val().email,
                amount: amount,
                state: data.state,
                created: dateTime,
            }
        },
        async getPendingRewards() {
            const pool = THX.contracts.instances.pool;
            const amountOfRewards = await pool.methods.countRewards().call()
            const isManager = await pool.methods.isManager(THX.contracts.loomAddress).call()

            if (isManager) {
                let rewards = []

                for (var i = 0; i < parseInt(amountOfRewards); i++) {
                    const data = await pool.methods.rewards(i).call()
                    const reward = await this.formatReward(data);
                    rewards.push(reward);
                }

                return rewards.filter((r) => r.state == 0);
            }
        },
        approveReward(id) {
            const pool = THX.contracts.instances.pool;

            this.approveBusy = true;

            return pool.methods.approveReward(id).send({ from: THX.contracts.loomAddress })
                .then(() => {
                    this.approveBusy = false;
                    return this.update();
                })
                .catch(e => {
                    this.rejectBusy = false;
                    // eslint-disable-next-line
                    return console.error(e);
                });
        },
        rejectReward(id) {
            const pool = THX.contracts.instances.pool;

            this.rejectBusy = true;

            return pool.methods.rejectReward(id).send({ from: THX.contracts.loomAddress })
                .then(() => {
                    this.rejectBusy = false;
                    return this.update();
                })
                .catch(e => {
                    this.rejectBusy = false;
                    // eslint-disable-next-line
                    return console.error(e);
                });
        }
    }
}
</script>
