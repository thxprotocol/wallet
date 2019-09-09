<template>
<article class="region region--container overflow">

    <div v-if="notifications.length == 0" class="d-flex w-100 h-100 align-items-center justify-content-center">
        <BSpinner variant="light" label="Loading..."></BSpinner>
    </div>

    <b-card
        v-bind:key="n.id"
        v-for="n in notifications"
        header-tag="header"
        footer-tag="footer"
        tag="article"
        class="mb-2"
        style="margin: 1rem; width: 100%">

        <template slot="header">
            <div class="d-flex w-100 align-items-center">
                <div>
                    <ProfilePicture class="mr-3" size="sm" :uid="n.user.uid"></ProfilePicture>
                </div>
                <div style="flex: 1;">
                    <span><strong>{{n.user.firstName}}</strong> claimed <strong>{{ n.amount}} THX</strong> as a reward for the rule <strong>{{ n.slug }}</strong>.</span>
                </div>
                <div>
                    <span class="badge badge-success float-right">{{n.state}}</span>
                </div>
            </div>
        </template>

        <b-card-text>
            <p>
                {{ n.pool.name }} <strong>[{{ n.pool.balance }} THX]</strong><br>
                <small>{{ n.created | moment('MMMM Do YYYY HH:mm') }}</small>
            </p>
            <hr class="dotted" />

            <div v-if="n.poll">
                <h3>Poll period:</h3>
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
                <h3>Votes ({{n.poll.totalVoted}})</h3>
                <div class="row">
                    <div class="col-12">
                        <BProgress show-progress :max="(n.poll.yesCounter + n.poll.noCounter)">
                            <BProgressBar variant="success" :value="n.poll.yesCounter"></BProgressBar>
                            <BProgressBar variant="danger" :value="n.poll.noCounter"></BProgressBar>
                        </BProgress>
                    </div>
                    <div class="col-6">
                        {{n.poll.yesCounter}}
                    </div>
                    <div class="col-6 text-right">
                        {{n.poll.noCounter}}
                    </div>
                </div>
            </div>
        </b-card-text>

        <template slot="footer">
            <div class="row" v-if="!n.hasVoted && n.poll.now < n.poll.endTime">
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
            <div class="row" v-if="n.hasVoted && n.poll.now < n.poll.endTime">
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
import ProfilePicture from '../components/ProfilePicture';
import { BSpinner, BCard, BCardText, BProgress, BProgressBar } from 'bootstrap-vue';

import Vue from 'vue';

const RewardState = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];

export default {
    name: 'home',
    components: {
        BSpinner,
        ProfilePicture,
        'b-card': BCard,
        'b-card-text': BCardText,
        BProgress,
        BProgressBar,
    },
    data: function() {
        return {
            events: new EventService(),
            network: null,
            notifications: [],
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
                            const state = await contract.methods.state().call();

                            // TEMP Check if state is pending (0)
                            if (state == 3) {
                                const reward = await this.formatReward(contract, pool);

                                Vue.set(this.notifications, reward.id, reward);
                            }
                        }
                    }
                }
            })
        },
        async formatReward(contract, pool) {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const utils = THX.network.loom.utils;
            const address = THX.network.account.address;

            const id = parseInt(await contract.methods.id().call());
            const slug = await contract.methods.slug().call();
            const dateTime = parseInt(await contract.methods.created().call());
            const amount = utils.fromWei(await contract.methods.amount().call(), 'ether');
            const state = RewardState[await contract.methods.state().call()];
            const beneficiary = (await contract.methods.beneficiary().call()).toLowerCase();

            const wallet = await firebase.database().ref('wallets').child(beneficiary).once('value');
            const user = await firebase.database().ref(`users/${wallet.val().uid}`).once('value');

            const rule = await firebase.database().ref(`pools/${pool._address}/rules/${slug}`).once('value');
            const totalVoted = await contract.methods.totalVoted().call();
            const yesCounter = await contract.methods.yesCounter().call();
            const noCounter = await contract.methods.noCounter().call();
            const startTime = await contract.methods.startTime().call();
            const endTime = await contract.methods.endTime().call();
            const now = (await THX.network.loom.eth.getBlock('latest')).timestamp;
            const diff = (endTime - now);

            const vote = await contract.methods.votesByAddress(address).call();
            const poolName = await pool.methods.name().call();
            const balance = await token.methods.balanceOf(pool._address).call();

            return {
                id: id,
                pool: {
                    address: pool._address,
                    name: poolName,
                    balance: utils.fromWei(balance, 'ether'),
                },
                user: user.val(),
                rule: rule.val(),
                slug: slug,
                amount: amount,
                state: state,
                created: dateTime,
                poll: {
                    now: parseInt(now),
                    diff: diff,
                    totalVoted: totalVoted,
                    startTime: parseInt(startTime),
                    endTime: parseInt(endTime),
                    hasVoted: (parseInt(vote.time) > 0),
                    yesCounter: parseInt(utils.fromWei(yesCounter, 'ether')),
                    noCounter: parseInt(utils.fromWei(noCounter, 'ether')),
                }
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
