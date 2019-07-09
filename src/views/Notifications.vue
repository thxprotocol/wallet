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

const THX = window.THX;

export default {
    name: 'home',
    data: function() {
        return {
            ea: new EventService(),
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
        // eslint-disable-next-line
        THX.ns.connect().then(() => this.init()).catch(() => console.error);
    },
    methods: {
        async init() {
            const pool = THX.ns.instances.pool;
            const token = THX.ns.instances.token;

            // Get the pool information
            this.pool.name = await pool.methods.name().call()
            this.pool.balance = await token.methods.balanceOf(pool.address).call()

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
            const pool = THX.ns.instances.pool;
            const amountOfRules = await pool.methods.countRules().call()
            const isMember = true; //await pool.methods.isMember(THX.ns.accounts[0]).call();

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
            const pool = THX.ns.instances.pool;
            const amountOfRewards = await pool.methods.countRewards().call()
            const isManager = await pool.methods.isManager(THX.ns.accounts[0]).call()

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
            const wallet = await firebase.database().ref('wallets').child(data.beneficiary).once('value');
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
            const pool = THX.ns.instances.pool;
            const data = pool.methods.approveReward(id).encodeABI();
            const rawTx = await THX.ns.signContractMethod(pool.address, data);

            await THX.ns.sendSignedTransaction(rawTx);

            this.update();
        },
        async rejectReward(id) {
            const pool = THX.ns.instances.pool;
            const data = pool.methods.rejectReward(id).encodeABI();
            const rawTx = await THX.ns.signContractMethod(pool.address, data);

            await THX.ns.sendSignedTransaction(rawTx);

            this.update();
        }
    }
}
</script>
