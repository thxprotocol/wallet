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
                    <button class="btn btn--default" v-on:click="rejectReward(n.id)">
                        Reject
                    </button>
                    <button class="btn btn--success" v-on:click="approveReward(n.id)">
                        Approve
                    </button>
                </div>
            </template>
        </div>
    </div>

    <ul class="list list--nav">
        <li v-bind:key="n.id" v-for="n in notifications">
            <button v-bind:class="`${(n.id == currentNotification) ? 'active' : ''}`">{{ n.id }}</button>
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
        }
    },
    created() {
        const uid = firebase.auth().currentUser.uid;
        const key = (typeof this.state.getItem('privateKey') !== "undefined") ? this.state.getItem('privateKey') : null;

        this.init(uid, key);
    },
    methods: {
        async init(uid, key) {
            let token, pool;

            await THX.contracts.load(key);

            pool = THX.contracts.instances.pool;
            token = THX.contracts.instances.token;

            this.pool.name = await pool.methods.name().call()
            this.pool.balance = await token.methods.balanceOf(pool._address).call()

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
        async getPendingRules() {
            const pool = THX.contracts.instances.pool;
            const amountOfRules = await pool.methods.countRules().call()
            const isMember = true; //await pool.methods.isMember(THX.contracts.currentUserAddress).call();

            if (isMember) {
                let rules = [];

                for (var i = 0; i < parseInt(amountOfRules); i++) {
                    let rule = await pool.methods.rules(i).call()
                    rules.push(rule);
                }

                return rules.filter(r => r.state == 0);
            }
        },
        async getPendingRewards() {
            const pool = THX.contracts.instances.pool;
            const amountOfRewards = await pool.methods.countRewards().call()
            const isManager = await pool.methods.isManager(THX.contracts.currentUserAddress).call()

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
        async approveReward(id) {
            const pool = THX.contracts.instances.pool;
            await pool.methods.approveReward(id).send({ from: THX.contracts.currentUserAddress })

            this.update();
        },
        async rejectReward(id) {
            const pool = THX.contracts.instances.pool;

            await pool.methods.rejectReward(id).send({ from: THX.contracts.currentUserAddress })

            this.update();
        }
    }
}
</script>
