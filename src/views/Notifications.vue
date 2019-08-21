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
import EventService from '../services/EventService';

import RewardPool from '../contracts/RewardPool.json';
import Reward from '../contracts/Reward.json';

const THX = window.THX;

const RewardState = ['Pending', 'Active', 'Disabled'];

export default {
    name: 'home',
    data: function() {
        return {
            events: new EventService(),
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
        this.init(uid);
    },
    methods: {
        async init(uid) {
            firebase.database().ref(`users/${uid}/pools`).once('value').then(async s => {
                const THX = window.THX;
                const pools = s.val();

                // Get all the pools
                for (let poolAddress in pools) {
                    const pool = await THX.network.contract(RewardPool, poolAddress);
                    const amountOfRewards = await pool.methods.countRewards().call()
                    const isManager = await pool.methods.isManager(THX.network.account.address).call()

                    if (isManager) {
                        for (var i = 0; i < amountOfRewards; i++) {
                            const rewardAddress = await pool.methods.rewards(i).call();
                            const contract = await THX.network.contract(Reward, rewardAddress);
                            const reward = await this.formatReward(contract, poolAddress);

                            this.notifications.push(reward);
                        }
                    }
                }
            })
        },
        async formatReward(contract, poolAddress) {
            const THX = window.THX;
            const utils = THX.network.loom.utils;

            const id = parseInt(await contract.methods.id().call());
            const dateTime = new Date(parseInt(await contract.methods.created().call()));
            const amount = await contract.methods.amount().call();
            const state = RewardState[await contract.methods.state().call()];
            const beneficiary = (await contract.methods.beneficiary().call()).toLowerCase();
            const wallet = await firebase.database().ref('wallets').child(beneficiary).once('value');
            const user = await firebase.database().ref(`users/${wallet.val().uid}`).once('value');
            const rule = await firebase.database().ref(`pools/${poolAddress}/rules/${id}`).once('value');
            const yesCounter = await contract.methods.yesCounter().call();
            const noCounter = await contract.methods.noCounter().call();

            return {
                id: id,
                title: rule.val().title,
                description: rule.val().description,
                beneficiary: user.val().email,
                amount: amount,
                state: state,
                created: dateTime,
                pool: poolAddress,
                yesCounter: utils.fromWei(yesCounter, 'ether'),
                noCounter: utils.fromWei(noCounter, 'ether'),
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

        }
    }
}
</script>
