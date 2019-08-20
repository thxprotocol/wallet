<template>
<article class="region region--container">
    <!-- <main class="region region--content">
        <template v-for="n in notifications">
            {{n}}
        </template>
    </main> -->

    <div class="list list--swipe">
        <div v-bind:key="n.id" v-for="n in notifications" class="notification">
            <template v-if="n.beneficiary">
                <h2 class="font-size-large">
                    {{ n.title }}
                    <span class="badge badge--default">{{ n.state }}</span>
                </h2>
                <p>
                    Approved: <strong>{{ n.yesCounter }}</strong> | Rejected: <strong>{{ n.noCounter }}</strong>
                </p>
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
                    <button v-bind:class="{ disabled: voteBusy }" class="btn btn--default" v-on:click="vote(n.id, false)">
                        Reject
                    </button>
                    <button v-bind:class="{ disabled: voteBusy }" class="btn btn--success" v-on:click="vote(n.id, true)">
                        Approve
                    </button>
                </div>
                <div class="notification__actions" v-if="n.voted">
                    <button v-bind:class="{ disabled: voteBusy }" class="btn btn--link" v-on:click="revokeVote(n.id)">
                        Revoke Vote
                    </button>
                </div>
            </template>
        </div>
    </div>

</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';

import EventAggregator from '../services/EventAggregator';
import StateService from '../services/StateService.js';

import RewardJSON from '../contracts/Reward.json';

const THX = window.THX;
const RewardState = ['Pending', 'Active', 'Disabled'];

export default {
    name: 'home',
    data: function() {
        return {
            ea: new EventAggregator(),
            state: new StateService(),
            network: null,
            pool: {
                name: "",
                balance: 0
            },
            notifications: [],
            currentNotification: 0,
            voteBusy: false,
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

            await THX.networks(loomKey, ethKey);

            pool = THX.networks.instances.pool;
            token = THX.networks.instances.token;

            this.pool.name = await pool.methods.name().call();

            balanceInWei = await token.methods.balanceOf(pool._address).call()
            this.pool.balance = web3.utils.fromWei(balanceInWei, "ether");

            this.update()

            this.ea.listen('event.RewardStateChanged', this.handleRewardStateChange);

            // const isMember = await pool.methods.isMember(THX.networks.loomAddress).call()
        },
        handleRewardStateChange() {
            return this.update();
        },
        async update() {
            const rewards = await this.getPendingRewards();

            this.notifications = rewards;
        },
        async formatReward(contract) {
            const id = parseInt(await contract.methods.id().call());
            const dateTime = new Date(parseInt(await contract.methods.created().call()));
            const amount = await contract.methods.amount().call();
            const state = RewardState[await contract.methods.state().call()];
            const beneficiary = (await contract.methods.beneficiary().call()).toLowerCase();
            const wallet = await firebase.database().ref('wallets').child(beneficiary).once('value');
            const user = await firebase.database().ref(`users/${wallet.val().uid}`).once('value');
            const rule = await firebase.database().ref(`pools/${THX.networks.instances.pool._address}/rules/${id}`).once('value');
            const yesCounter = await contract.methods.yesCounter().call();
            const noCounter = await contract.methods.noCounter().call();
            const web3 = THX.networks.loomWeb3;

            return {
                id: id,
                title: rule.val().title,
                description: rule.val().description,
                beneficiary: user.val().email,
                amount: amount,
                state: state,
                created: dateTime,
                yesCounter: web3.utils.fromWei(yesCounter, 'ether'),
                noCounter: web3.utils.fromWei(noCounter, 'ether'),
            }
        },
        async getPendingRewards() {
            const pool = THX.networks.instances.pool;
            const amountOfRewards = await pool.methods.countRewards().call()
            const isManager = await pool.methods.isManager(THX.networks.loomAddress).call()
            const web3 = THX.networks.loomWeb3;

            if (isManager) {
                let rewards = []

                for (var i = 0; i < amountOfRewards; i++) {
                    const rewardAddress = await pool.methods.rewards(i).call();
                    const rewardContract = new web3.eth.Contract(RewardJSON.abi, rewardAddress, { from: THX.networks.loomAddress });
                    const reward = await this.formatReward(rewardContract);

                    rewards.push(reward);
                }

                return rewards;
            }
        },
        async revokeVote(id) {
            const pool = THX.networks.instances.pool;
            const isManager = await pool.methods.isManager(THX.networks.loomAddress).call()

            if (isManager) {
                return pool.methods.revokeVoteForReward(id).send({ from: THX.networks.loomAddress })
                    .then(() => {
                        this.voteBusy = false;
                        return this.update();
                    })
                    .catch(e => {
                        this.voteBusy = false;
                        // eslint-disable-next-line
                        return console.error(e);
                    });
            }
            else {
                this.voteBusy = false;
            }

        },
        async vote(id, agree) {
            const pool = THX.networks.instances.pool;
            const isManager = await pool.methods.isManager(THX.networks.loomAddress).call()

            this.voteBusy = true;

            if (isManager) {
                return pool.methods.voteForReward(id, agree).send({ from: THX.networks.loomAddress })
                    .then(() => {
                        this.voteBusy = false;
                        return this.update();
                    })
                    .catch(e => {
                        this.voteBusy = false;
                        // eslint-disable-next-line
                        return console.error(e);
                    });
            }
            else {
                this.voteBusy = false;
            }

        }
    }
}
</script>
