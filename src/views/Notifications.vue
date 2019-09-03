<template>
<article class="region region--container overflow">

    <b-card
        v-bind:key="n.id"
        v-for="n in notifications"
        v-bind:title="n.beneficiary"
        v-bind:sub-title="n.created | moment('MMMM Do YYYY HH:mm')"
        footer-tag="footer"
        tag="article"
        class="mb-2"
        style="margin: 1rem; width: 100%">

        <b-card-text>
            <strong class="font-size-lg">{{ n.amount }} THX</strong>

            <div v-if="n.poll">
                <h3><strong>Poll period:</strong></h3>
                <div class="row">
                    <div class="col-12">
                        <BProgress
                            variant="info"
                            :value="((n.poll.now - n.poll.startTime) / (n.poll.endTime - n.poll.startTime)) * 100"
                            :max="100"
                        ></BProgress>
                    </div>
                    <div class="col-6">
                        {{n.poll.startTime | moment("MMMM Do YYYY HH:mm") }}
                    </div>
                    <div class="col-6 text-right">
                        {{n.poll.endTime | moment("MMMM Do YYYY HH:mm") }}
                    </div>
                </div>
                <hr class="dotted">
            </div>

            <div class="row">
                <div class="col-12">
                    Amount of tokens: {{n.yesCounter + n.noCounter}}
                    <b-progress show-progress :max="(n.yesCounter + n.noCounter)">
                        <b-progress-bar variant="success" :value="n.yesCounter"></b-progress-bar>
                        <b-progress-bar variant="danger" :value="n.noCounter"></b-progress-bar>
                    </b-progress>
                </div>
                <div class="col-6">
                    <strong>{{n.yesCounter}}</strong>
                </div>
                <div class="col-6 text-right">
                    <strong>{{n.noCounter}}</strong>
                </div>
            </div>

            <strong>{{ n.title }}</strong><br>
            <p>{{ n.description }}</p>

            <hr class="dotted" />
            <p>
                {{ n.pool.name }} <strong>[{{ n.pool.balance }} THX]</strong><br>
            </p>
            <p>
                <button v-bind:class="{ disabled: loading }" class="btn btn-link" v-on:click="finalizePoll(n.id, n.pool.address)">
                    Finalize poll
                </button>
            </p>
        </b-card-text>

        <template slot="footer">
            <div class="row" v-if="!n.hasVoted">
                <div class="col-6">
                    <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" v-on:click="vote(n.id, true, n.pool.address)">
                        Approve
                    </button>
                </div>
                <div class="col-6">
                    <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" v-on:click="vote(n.id, false, n.pool.address)">
                        Reject
                    </button>
                </div>
            </div>
            <div class="row" v-if="n.hasVoted">
                <div class="col-12">
                    <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" v-on:click="revokeVote(n.id, n.pool.address)">
                        Revoke Vote
                    </button>
                </div>
            </div>
        </template>

    </b-card>

</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService';
import RewardPool from '../contracts/RewardPool.json';
import Reward from '../contracts/Reward.json';
import { BCard, BCardText, BProgress, BProgressBar } from 'bootstrap-vue';

import Vue from 'vue';

const RewardState = ['Pending', 'Approved', 'Rejected'];

export default {
    name: 'home',
    components: {
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
    },
    data: function() {
        return {
            events: new EventService(),
            network: null,
            pool: {
                name: "",
                balance: 0
            },
            notifications: {},
            currentNotification: 0,
            loading: false,
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

                            Vue.set(this.notifications, reward.id, reward);
                        }
                    }
                }
            })
        },
        async formatReward(contract, poolAddress) {
            const THX = window.THX;
            const utils = THX.network.loom.utils;
            const address = THX.network.account.address;

            const id = parseInt(await contract.methods.id().call());
            const slug = await contract.methods.slug().call();
            const dateTime = parseInt(await contract.methods.created().call());
            const amount = await contract.methods.amount().call();
            const state = RewardState[await contract.methods.state().call()];
            const beneficiary = (await contract.methods.beneficiary().call()).toLowerCase();
            const wallet = await firebase.database().ref('wallets').child(beneficiary).once('value');
            const user = await firebase.database().ref(`users/${wallet.val().uid}`).once('value');
            const rule = await firebase.database().ref(`pools/${poolAddress}/rules/${slug}`).once('value');
            const yesCounter = await contract.methods.yesCounter().call();
            const noCounter = await contract.methods.noCounter().call();
            const vote = await contract.methods.votesByAddress(address).call();
            const pool = await THX.network.contract(RewardPool, poolAddress);
            const poolName = await pool.methods.name().call();

            return {
                id: id,
                title: rule.val().title,
                description: rule.val().description,
                beneficiary: user.val().email,
                amount: amount,
                state: state,
                created: dateTime,
                pool: {
                    address: poolAddress,
                    name: poolName,
                    balance: 0
                },
                hasVoted: (parseInt(vote.time) > 0),
                yesCounter: parseInt(utils.fromWei(yesCounter, 'ether')),
                noCounter: parseInt(utils.fromWei(noCounter, 'ether')),
                poll: null,
            }
        },
        async finalizePoll(id, poolAddress) {
            const THX = window.THX;
            const pool = await THX.network.contract(RewardPool, poolAddress);
            const rewardAddress = await pool.methods.rewards(id).call();
            const reward = await THX.network.contract(Reward, rewardAddress);

            this.loading = true;

            return await reward.methods.tryToFinalize()
                .send({ from: THX.network.account.address })
                .then(async tx => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.log(tx);
                })
                .catch(err => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.error(err);
                })
        },
        async vote(id, agree, poolAddress) {
            const THX = window.THX;
            const pool = await THX.network.contract(RewardPool, poolAddress);
            const isManager = await pool.methods.isManager(THX.network.account.address).call()

            this.loading = true;

            if (isManager) {
                return pool.methods.voteForReward(id, agree).send({ from: THX.network.account.address })
                    .then(() => {
                        this.notifications[id].hasVoted = true;
                        this.loading = false;
                    })
                    .catch(e => {
                        this.loading = false;
                        // eslint-disable-next-line
                        return console.error(e);
                    });
            }
            else {
                this.loading = false;
            }

        },
        async revokeVote(id, poolAddress) {
            const THX = window.THX;
            const pool = await THX.network.contract(RewardPool, poolAddress);
            const isManager = await pool.methods.isManager(THX.network.account.address).call()

            if (isManager) {
                return pool.methods.revokeVoteForReward(id).send({ from: THX.network.account.address })
                    .then(() => {
                        this.notifications[id].hasVoted = false;
                        this.loading = false;
                    })
                    .catch(e => {
                        this.loading = false;
                        // eslint-disable-next-line
                        return console.error(e);
                    });
            }
            else {
                this.loading = false;
            }

        }
    }
}
</script>
