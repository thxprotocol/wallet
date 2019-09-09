<template>
    <BCard
        footer-tag="footer"
        header-tag="header"
        tag="article"
        class="mb-2">

        <template v-if="loading">
            <div class="text-center">
                <BSpinner label="Loading..."></BSpinner>
            </div>
        </template>

        <template v-if="!loading">
            <template slot="header">
                <span v-if="rule.state == 'Active'" class="badge badge-success float-right">{{ rule.state }}</span>
                <span v-if="rule.state == 'Disabled' " class="badge badge-danger float-right">{{ rule.state }}</span>
                <strong>{{meta.title}}</strong><br>
                <small>#{{ rule.id }} {{ rule.slug }}</small>
            </template>

            <BCardText>
                <p>{{meta.description}}</p>
                <strong>Reward: {{ rule.amount }} THX</strong>
                <div class="text-right">
                    <button
                        v-if="rule.poll !== '0x0000000000000000000000000000000000000000'"
                        class="btn btn-link"
                        @click="showRulePoll()">View running poll</button>
                    <button
                        v-if="rule.poll === '0x0000000000000000000000000000000000000000'"
                        class="btn btn-link"
                        @click="modal.startPoll = true">Propose reward size</button>
                </div>
            </BCardText>
        </template>

        <Modal v-if="modal.rulePoll" @close="modal.rulePoll = false">
            <h3 slot="header">Running Rule Proposal</h3>
            <div slot="body" v-if="!loading">
                <div class="alert alert-danger" v-if="alert.noVote">
                    <strong>A problem occured while processing your vote or revoke request. Verify that the voting period did not end.</strong>
                </div>
                <div v-if="poll">
                    <h3>{{meta.title}}</h3>
                    <p><i>{{meta.description}}</i></p>
                    <p>
                        Proposal: <del><strong>{{poll.amount}} THX</strong></del> > <strong>{{poll.proposedAmount}} THX</strong>
                    </p>
                    <hr class="dotted">
                    <h3>Poll period:</h3>
                    <div class="row">
                        <div class="col-12">
                            <BProgress
                                variant="info"
                                :value="((poll.now - poll.startTime) / (poll.endTime - poll.startTime)) * 100"
                                :max="100"
                            ></BProgress>
                        </div>
                        <div class="col-6">
                            {{poll.startTime | moment("MMMM Do YYYY HH:mm") }}
                        </div>
                        <div class="col-6 text-right">
                            {{poll.endTime | moment("MMMM Do YYYY HH:mm") }}
                        </div>
                    </div>
                    <hr class="dotted">
                    <h3>Votes ({{poll.totalVoted}})</h3>
                    <div class="row">
                        <div class="col-12">
                            <BProgress show-progress :max="(poll.yesCounter + poll.noCounter)">
                                <BProgressBar variant="success" :value="poll.yesCounter"></BProgressBar>
                                <BProgressBar variant="danger" :value="poll.noCounter"></BProgressBar>
                            </BProgress>
                        </div>
                        <div class="col-6">
                            {{poll.yesCounter}}
                        </div>
                        <div class="col-6 text-right">
                            {{poll.noCounter}}
                        </div>
                    </div>
                </div>
                <div class="alert alert-warning" v-if="!account.isMember">
                    <strong>You are not a member of this pool and can not join the poll.</strong>
                </div>
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer" v-if="poll && account.isMember">
                <div class="row" v-if="poll.now > poll.endTime">
                    <div class="col-12">
                        <button @click="finalizePoll()" v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block">Finalize Poll</button>
                    </div>
                </div>
                <div class="row" v-if="!poll.hasVoted && poll.now < poll.endTime">
                    <div class="col-6">
                        <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" @click="vote(true)">Approve</button>
                    </div>
                    <div class="col-6">
                        <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" @click="vote(false)">Reject</button>
                    </div>
                </div>
                <div class="row" v-if="poll.hasVoted && poll.now < poll.endTime">
                    <div class="col-12">
                        <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" @click="revokeVote()">Revoke</button>
                    </div>
                </div>
            </template>
        </Modal>

        <Modal v-if="modal.startPoll" @close="modal.startPoll = false">
            <h3 slot="header">Propose new reward size</h3>
            <p>Propose a new reward size for this rule. A poll will be started and members of the pool can vote to approve or reject your proposal over a set amount of time.</p>
            <div slot="body" v-if="!loading">
                <input v-model="input.proposedAmount" type="number" class="form-control" />
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="startPoll()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Start proposal</button>
            </template>
        </Modal>

    </BCard>

</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import Modal from '../components/Modal';
import RulePoll from '../contracts/RulePoll.json';
import { BCard, BCardText, BSpinner, BProgress, BProgressBar } from 'bootstrap-vue';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'Rule',
    components: {
        Modal,
        BCard,
        BCardText,
        BSpinner,
        BProgress,
        BProgressBar,
    },
    data: function() {
        return {
            loading: false,
            modal: {
                rulePoll: false,
                startPoll: false,
                // finalizePoll: false,
                ruleInfo: false,
            },
            alert: {
                noVote: false,
            },
            meta: {
                title: '',
                description: '',
            },
            poll: null,
            input: {
                proposedAmount: 0,
            }
        }
    },
    props: {
        rule: null,
        contract: null,
        account: {
            loom: {
                address: ''
            },
            isMember: false,
            isManager: false,
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        async init() {
            this.loading = true;
            this.meta = (await this.getRuleMeta()).val();
            this.loading = false;
        },
        async getRuleMeta() {
            const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);

            return await rulesRef.child(this.rule.slug).once('value');
        },
        async showRulePoll() {
            this.loading = true;
            this.modal.rulePoll = true;
            this.poll = await this.getRulePoll();
        },
        async getRulePoll() {
            if (this.rule.poll !== "0x0000000000000000000000000000000000000000") {
                const THX = window.THX;
                const utils = THX.network.loom.utils;
                const rulePoll = await THX.network.contract(RulePoll, this.rule.poll);
                const id = parseInt(await rulePoll.methods.id().call());
                const proposedAmount = utils.fromWei(await rulePoll.methods.proposedAmount().call(), 'ether');
                const vote = await rulePoll.methods.votesByAddress(this.account.loom.address).call();
                const minVotedTokensPerc = await this.contract.methods.minVotedTokensPerc().call();
                // const votedTokensPerc = await rulePoll.methods.getVotedTokensPerc().call();
                const yesCounter = await rulePoll.methods.yesCounter().call();
                const noCounter = await rulePoll.methods.noCounter().call();
                const totalVoted = await rulePoll.methods.totalVoted().call();
                const finalized = await rulePoll.methods.finalized().call();
                const startTime = await rulePoll.methods.startTime().call();
                const endTime = await rulePoll.methods.endTime().call();
                const now = (await THX.network.loom.eth.getBlock('latest')).timestamp;
                const diff = (endTime - now);
                const meta = (await this.getRuleMeta()).val();

                this.loading = false;

                return this.poll = {
                    id: id,
                    amount: this.rule.amount,
                    proposedAmount: proposedAmount,
                    minVotedTokensPerc: minVotedTokensPerc,
                    // votedTokensPerc: votedTokensPerc,
                    yesCounter: parseInt(new BN(yesCounter).div(tokenMultiplier)),
                    noCounter: parseInt(new BN(noCounter).div(tokenMultiplier)),
                    totalVoted: totalVoted,
                    hasVoted: parseInt(vote.time) > 0,
                    now: now,
                    startTime: parseInt(startTime),
                    endTime: parseInt(endTime),
                    diff: diff,
                    address: this.rule.poll,
                    finalized: finalized,
                    meta: meta,
                }
            }

        },
        async vote(agree) {
            this.loading = true;

            return await this.contract.methods.voteForRule(this.poll.id, agree)
                .send({from: this.account.loom.address })
                .then(async (tx) => {
                    this.poll = await this.getRulePoll();

                    // eslint-disable-next-line
                    console.log(tx);
                })
                .catch(async (err) => {
                    this.alert.noVote = true;
                    this.loading = false;

                    // eslint-disable-next-line
                    console.error(err);
                });
        },
        async revokeVote() {
            this.loading = true;

            return await this.contract.methods.revokeVoteForRule(this.poll.id)
                .send({from: this.account.loom.address })
                .then(async (tx) => {
                    this.poll = await this.getRulePoll();

                    // eslint-disable-next-line
                    console.log(tx);
                })
                .catch(async (err) => {
                    this.alert.noVote = true;
                    this.loading = false;
                    // eslint-disable-next-line
                    console.error(err);
                });
        },
        async finalizePoll() {
            const THX = window.THX;
            const rulePoll = await THX.network.contract(RulePoll, this.rule.poll);

            this.loading = true;

            return await rulePoll.methods.tryToFinalize()
                .send({ from: this.account.loom.address })
                .then(async tx => {
                    this.loading = false;
                    this.modal.rulePoll = false;
                    this.rule.poll = "0x0000000000000000000000000000000000000000";

                    // eslint-disable-next-line
                    console.log(tx);
                })
                .catch(err => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.error(err);
                })
        },
        async startPoll() {
            const THX = window.THX;
            const utils = THX.network.loom.utils;
            const amount = utils.toWei(this.input.proposedAmount, 'ether');

            this.modal.startPoll = false;
            this.loading = true;

            return await this.contract.methods.startRulePoll(this.rule.id, amount)
                .send({ from: this.account.loom.address })
                .then(async tx => {
                    this.input.proposedAmount = 0;
                    this.modal.startPoll = false;
                    this.poll = await this.getRulePoll();

                    // eslint-disable-next-line
                    console.log(tx);
                })
                .catch(err => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.error(err);
                })
        },
    }
}
</script>
