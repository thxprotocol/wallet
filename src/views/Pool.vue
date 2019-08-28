<template>
    <article class="region region--container">
        <main class="region region--content">
            <div class="region region--jumbotron">
                <strong class="font-size-xl">{{this.balance.pool}} THX</strong>
                <p>{{ pool.name }}</p>
            </div>

            <div class="row">
                <div class="col-12">
                    <b-tabs content-class="mt-4" justified>

                        <b-tab title="Rules" active>

                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <th>#</th>
                                        <th>slug</th>
                                        <th>amount</th>
                                        <th>poll</th>
                                        <th>actions</th>
                                        <th>state</th>
                                    </thead>
                                    <tr v-bind:key="rule.id" v-for="rule in rules">
                                        <td>
                                            {{ rule.id }}
                                        </td>
                                        <td>
                                            {{ rule.slug }}
                                        </td>
                                        <td>
                                            {{ rule.amount }}
                                        </td>
                                        <td>
                                            <button v-if="rule.poll && !rule.poll.finalized" class="btn btn-link" @click="showPollModal(rule.poll)">View Poll</button>
                                            <button v-if="!rule.poll || rule.poll.finalized" class="btn btn-link" @click="onStartPoll(rule.id)">Start Poll</button>
                                            <button class="btn btn-link" @click="onFinalize(rule.id)">Finalize Poll</button>
                                        </td>
                                        <td>
                                            <strong>{{ rule.state }}</strong>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <button class="btn btn-link" @click="getRewardRules()">Refresh</button>
                            <button v-if="isManager" class="btn btn-primary" @click="showCreateRuleModal = true">Add new rule</button>

                        </b-tab>

                        <b-tab title="Rewards">

                        </b-tab>

                        <b-tab title="Events">

                            <div class="text-center" v-if="!orderedPoolTransfers.length">
                                <b-spinner label="Loading..."></b-spinner>
                            </div>

                            <b-list-group v-if="orderedPoolTransfers">
                                <b-list-group-item v-bind:key="transfer.timestamp" v-for="transfer in orderedPoolTransfers" variant="transfer.variant">
                                    <div class="d-flex w-100 justify-content-between">
                                        <strong>{{transfer.amount}} THX</strong>
                                        <small>{{ transfer.timestamp | moment("MMMM Do YYYY HH:mm") }}</small>
                                    </div>
                                    <small class="mb-1">Sender: {{transfer.sender}}</small>
                                </b-list-group-item>
                            </b-list-group>

                        </b-tab>

                        <b-tab title="Actions">

                            <ul class="list-bullets">
                                <li v-if="isManager"><button class="btn btn-link" @click="showAddManagerModal = true">Add Manager</button></li>
                                <li v-if="isMember"><button class="btn btn-link" @click="showAddMemberModal = true">Invite Member</button></li>
                                <li><button class="btn btn-link" @click="showTransferToPoolModal = true">Pool Deposit</button></li>
                            </ul>

                        </b-tab>
                    </b-tabs>
                </div>
            </div>

            <modal v-if="showRuleProposalModal" @close="showRuleProposalModal = false">
                <h3 slot="header">Running Rule Proposal:</h3>
                <div slot="body">
                    <div v-if="poll">
                        <h3><strong>{{poll.rule.title}}</strong></h3>
                        <p><i>{{poll.rule.description}}</i></p>
                        <p>
                            Proposal: <del><strong>{{poll.amount}} THX</strong></del> > <strong>{{poll.proposedAmount}} THX</strong>
                        </p>
                        <hr class="dotted">
                        <h3><strong>Poll period:</strong></h3>
                        <div class="row">
                            <div class="col-12">
                                <b-progress
                                    variant="info"
                                    :value="((poll.now - poll.startTime) / (poll.endTime - poll.startTime)) * 100"
                                    :max="100"
                                ></b-progress>
                            </div>
                            <div class="col-6">
                                {{poll.startTime | moment("MMMM Do YYYY HH:mm") }}
                            </div>
                            <div class="col-6 text-right">
                                {{poll.endTime | moment("MMMM Do YYYY HH:mm") }}
                            </div>
                        </div>
                        <hr class="dotted">

                        <h3><strong>Votes ({{poll.totalVoted}})</strong></h3>
                        <div class="row">
                            <div class="col-12">
                                <b-progress show-progress :max="(poll.yesCounter + poll.noCounter)">
                                    <b-progress-bar variant="success" :value="poll.yesCounter"></b-progress-bar>
                                    <b-progress-bar variant="danger" :value="poll.noCounter"></b-progress-bar>
                                </b-progress>
                            </div>
                            <div class="col-6">
                                {{poll.yesCounter}}
                            </div>
                            <div class="col-6 text-right">
                                {{poll.noCounter}}
                            </div>
                        </div>
                    </div>
                </div>
                <template slot="footer" v-if="poll">
                    <div class="alert alert-warning" v-if="!isMember">
                        <strong>You are not a member of this pool and can not join the poll.</strong>
                    </div>
                    <div v-if="isMember">
                        <div class="row" v-if="!poll.hasVoted">
                            <div class="col-6">
                                <button class="btn btn-primary btn-block" @click="onVoteForRule(poll, true)">Approve</button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-primary btn-block" @click="onVoteForRule(poll, false)">Reject</button>
                            </div>
                        </div>
                        <div class="row" v-if="poll.hasVoted">
                            <div class="col-12">
                                <button class="btn btn-primary btn-block" @click="onRevokeVoteForRule(poll)">Revoke</button>
                            </div>
                        </div>
                    </div>
                </template>
            </modal>

            <modal v-if="showCreateRuleModal" @close="showCreateRuleModal = false">
                <h3 slot="header">Create reward rule:</h3>
                <div slot="body">
                    <template v-if="!createRuleBusy">
                        <label for="slug">Slug:</label>
                        <input id="slug" v-model="newRule.slug" type="text" class="form-control" placeholder="complete_profile"/>
                        <label for="title">Title:</label>
                        <input id="title" v-model="newRule.title" type="text" class="form-control" placeholder="Complete your profile!"/>
                        <label for="description">Description:</label>
                        <textarea class="form-control"  width="100%" rows="3" id="description" v-model="newRule.description" placeholder="When filling all fields of your public profile you will receive the reward."> </textarea>
                        <label for="rewardSize">Reward size:</label>
                        <input id="rewardSize" v-model="newRule.size" type="number" class="form-control"  />
                    </template>

                    <span v-if="createRuleBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onCreateRewardRule()" v-bind:class="{ disabled: createRuleBusy }" class="btn btn-primary">Add new rule</button>
                </template>
            </modal>

            <modal v-if="showAddMemberModal" @close="showAddMemberModal = false">
                <h3 slot="header">Invite new member to the pool:</h3>
                <div slot="body">
                    <input v-if="!addMemberBusy" v-model="newMemberAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                    <span v-if="addMemberBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onAddMember()" v-bind:class="{ disabled: addMemberBusy }" class="btn btn-primary">Add member</button>
                </template>
            </modal>


            <modal v-if="showAddManagerModal" @close="showAddManagerModal = false">
                <h3 slot="header">Add a manager for this pool:</h3>
                <div slot="body">
                    <input v-if="!addManagerBusy" v-model="newMemberAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                    <span v-if="addManagerBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onAddManager()" v-bind:class="{ disabled: addManagerBusy }" class="btn btn-primary">Add manager</button>
                </template>
            </modal>

            <modal v-if="showTransferToPoolModal" @close="showTransferToPoolModal = false">
                <h3 slot="header">Reward pool deposit:</h3>
                <div slot="body">
                    <p>Reward Pool balance: <strong>{{this.balance.pool}} THX</strong></p>
                    <input v-if="!poolDepositBusy" v-model="transferToPoolAmount" type="number" class="form-control"  v-bind:max="balance.token" />
                    <span v-if="poolDepositBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onTransferToPool()" v-bind:class="{ disabled: poolDepositBusy }" class="btn btn-primary">Deposit {{ transferToPoolAmount }} THX</button>
                </template>
            </modal>

            <modal v-if="showChangeRuleModal" @close="showChangeRuleModal = false">
                <h3 slot="header">Propose rule change:</h3>
                <div slot="body">
                    <input v-if="!ruleRewardSizeBusy" v-model="changeRuleAmount" type="number" class="form-control" />
                    <span v-if="ruleRewardSizeBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="changeRule()" v-bind:class="{ disabled: ruleRewardSizeBusy }" class="btn btn-primary">Start proposal</button>
                </template>
            </modal>
        </main>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService';
import RewardPool from '../contracts/RewardPool.json';
import Reward from '../contracts/Reward.json';
import RulePoll from '../contracts/RulePoll.json';
import modal from '../components/Modal';
import { BSpinner, BProgress, BProgressBar, BTab, BTabs, BListGroup, BListGroupItem } from 'bootstrap-vue';

import Vue from 'vue';
const _ = require('lodash');

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));
const RuleState = ['Pending', 'Active', 'Disabled'];

export default {
    name: 'pool',
    components: {
        modal,
        'b-spinner': BSpinner,
        'b-tabs':BTabs,
        'b-tab':BTab,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: {
        orderedPoolTransfers: function () {
            return _.orderBy(this.poolTransfers, 'timestamp').reverse()
        }
    },
    data: function() {
        return {
            events: new EventService(),
            poolTransfers: [],
            isManager: false,
            isMember: false,
            rules: [],
            showCreateRuleModal: false,
            createRuleBusy: false,
            poolDepositBusy: false,
            transferToPoolAmount: 0,
            showAddMemberModal: false,
            showAddManagerModal: false,
            showTransferToPoolModal: false,
            newMemberAddress: '',
            addMemberBusy: false,
            addManagerBusy: false,
            newManagerAddress: '',
            showChangeRuleModal: false,
            showRuleProposalModal: false,
            ruleProposalBusy: false,
            ruleRewardSizeBusy: false,
            changeRuleAmount: 0,
            account: {
                loom: {
                    address: null
                }
            },
            newRule: {
                slug: '',
                title: '',
                description: '',
                size: 0,
            },
            poll: null,
            constract: null,
            pool: {
                name: '',
            },
            balance: {
                token: 0,
                pool: 0,
            }
        }
    },
    created() {
        this.poolAddress = this.$route.params.id;
        this.init();
    },
    methods: {
        async init() {
            const THX = window.THX;
            const token = THX.network.instances.token;
            let balanceInWei;

            this.contract = await THX.network.contract(RewardPool, this.poolAddress);

            this.account.loom = THX.network.account;
            this.account.rinkeby = THX.network.rinkeby.account;

            this.pool.name = await this.contract.methods.name().call();

            balanceInWei = await token.methods.balanceOf(this.poolAddress).call();
            this.balance.pool = new BN(balanceInWei).div(tokenMultiplier);

            balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
            this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

            this.isManager = await this.contract.methods.isManager(this.account.loom.address).call();
            this.isMember = await this.contract.methods.isMember(this.account.loom.address).call();

            this.$parent.$refs.header.updateBalance();

            this.subscribe();
            this.getRewardRules();

            this.events.listen('event.RuleStateChanged', this.onRuleStateChanged);

            // for (let e of this.events.poolEvents) {
                // this.contract.getPastEvents(e, { fromBlock: 0, toBlock: 'latest'})
                //     .then(events => {
                //         if (events.length > 0) {
                //             console.log(events);
                //             for (let event of events) {
                //                 this[`on${event.event}`](event.returnValues);
                //             }
                //         }
                //
                //     })
                //     .catch(err => {
                //         console.error(err);
                //     });
            // }
        },
        async subscribe() {
            const THX = window.THX;
            const amount = await this.contract.methods.countRewards().call();

            this.events.subscribePoolEvents(this.contract.events);

            for (let i = 0; i < parseInt(amount); i++) {
                const rewardAddress = await this.contract.methods.rewards(i).call();
                const reward = await THX.network.contract(Reward, rewardAddress);
                const state = await reward.methods.state().call();

                if (state !== 2) {
                    this.events.rewardSubscription(reward.events);
                }
            }
        },
        onDeposited(data) {
            this.poolTransfers.push({
                amount: `+${new BN(data.amount).div(tokenMultiplier)}`,
                timestamp: parseInt(data.created),
                sender: data.sender,
                variant: 'success'
            });
        },
        onWithdrawn(data) {
            this.poolTransfers.push({
                amount: `-${new BN(data.amount).div(tokenMultiplier)}`,
                timestamp: parseInt(data.created),
                sender: data.sender,
                variant: 'danger'
            });
        },
        onManagerAdded(data) {
            // eslint-disable-next-line
            console.log(data);
        },
        onMemberAdded(data) {
            // eslint-disable-next-line
            console.log(data);
        },
        onAddManager() {
            this.addManagerBusy = true;

            return this.contract.methods.addManager(this.newManagerAddress)
                .send({ from: this.account.loom.address })
                .then(async () => {
                    this.addManagerBusy = false;
                });
        },
        onAddMember() {
            this.addMemberBusy = true;

            return this.contract.methods.addMember(this.newMemberAddress).send({ from: this.account.loom.address })
                .then(async () => {
                    this.addMemberBusy = false;
                })
                .catch(async (err) => {
                    // eslint-disable-next-line
                    console.error(err);
                });
        },
        showPollModal(poll) {
            this.poll = poll;
            this.showRuleProposalModal = true;
        },
        async onVoteForRule(poll, agree) {
            this.poll.hasVoted = true;

            return await this.contract.methods.voteForRule(poll.id, agree).send({from: this.account.loom.address })
                .then(async () => {

                })
                .catch(async (err) => {
                    this.poll.hasVoted = false;
                    // eslint-disable-next-line
                    console.error(err);
                });
        },
        async onRevokeVoteForRule(poll) {
            this.poll.hasVoted = false;
            return await this.contract.methods.revokeVoteForRule(poll.id).send({from: this.account.loom.address })
                .then(async () => {

                })
                .catch(async (err) => {
                    this.poll.hasVoted = false;
                    // eslint-disable-next-line
                    console.error(err);
                });
        },
        onRuleStateChanged(data) {
            const rule = data.detail;
            const rulesRef = firebase.database().ref(`pools/${this.poolAddress}/rules`);

            if (this.rules[rule.id]) {
                Vue.set(this.rules[rule.id], 'state', RuleState[rule.state]);
            }

            rulesRef.child(rule.id).update({ state: RuleState[rule.state] })
            
            return this.getRewardRules();
        },
        async getRewards() {
            const amountOfRewards = parseInt( await this.contract.methods.countRewards().call() );

            for (let i = 0; i < amountOfRewards; i++) {
                const reward = await this.contract.methods.rewards(i).call();

                Vue.set(this.rewards, reward.id, {
                    id: reward.id,
                    slug: reward.slug,
                    beneficiary: reward.beneficiary,
                    amount: reward.amount,
                    state: reward.state,
                    created: reward.created,
                });
            }
        },
        async getRewardRules() {
            const amountOfRules = parseInt( await this.contract.methods.countRules().call() );

            for (let i = 0; i < amountOfRules; i++) {
                const rule = await this.contract.methods.rules(i).call();
                console.log(rule.poll)
                const poll = await this.getRulePoll(rule.poll);

                Vue.set(this.rules, rule.id, {
                    amount: rule.amount,
                    created: rule.created,
                    creator: rule.creator,
                    id: rule.id,
                    slug: rule.slug,
                    state: RuleState[rule.state],
                    poll: poll,
                });
            }
        },
        async getRulePoll(pollAddress) {
            if (pollAddress !== "0x0000000000000000000000000000000000000000") {
                const THX = window.THX;
                const rulePoll = await THX.network.contract(RulePoll, pollAddress);
                const id = parseInt(await rulePoll.methods.id().call());
                const rule = await this.contract.methods.rules(id).call();
                const proposedAmount = parseInt(await rulePoll.methods.proposedAmount().call());
                const rulesRef = firebase.database().ref(`pools/${this.poolAddress}/rules`);
                const vote = await rulePoll.methods.votesByAddress(this.account.loom.address).call();

                return rulesRef.child(rule.slug).once('value')
                    .then(async data => {
                        const yesCounter = await rulePoll.methods.yesCounter().call();
                        const noCounter = await rulePoll.methods.noCounter().call();
                        const totalVoted = await rulePoll.methods.totalVoted().call();
                        const now = (await THX.network.loom.eth.getBlock('latest')).timestamp;
                        const startTime = await rulePoll.methods.startTime().call();
                        const endTime = await rulePoll.methods.endTime().call();
                        const diff = (endTime - now);
                        const finalized = await rulePoll.methods.finalized().call();

                        return this.poll = {
                            id: id,
                            amount: rule.amount,
                            proposedAmount: proposedAmount,
                            yesCounter: parseInt(new BN(yesCounter).div(tokenMultiplier)),
                            noCounter: parseInt(new BN(noCounter).div(tokenMultiplier)),
                            totalVoted: totalVoted,
                            hasVoted: parseInt(vote.time) > 0,
                            now: now,
                            startTime: parseInt(startTime),
                            endTime: parseInt(endTime),
                            diff: diff,
                            address: rule.poll,
                            finalized: finalized,
                            rule: {
                                title: data.val().title,
                                description: data.val().description,
                                state: RuleState[data.val().state],
                                amount: data.val().amount,
                            }
                        }
                    });
            }

        },
        onStartPoll(id) {
            this.showChangeRuleModal = true;
            return this.changeRuleId = id;
        },
        async onFinalize(id) {
            const THX = window.THX;
            const rule = await this.contract.methods.rules(id).call();
            const rulePoll = await THX.network.contract(RulePoll, rule.poll);

            return await rulePoll.methods.tryToFinalize()
                .send({ from: this.account.loom.address })
                .then(tx => {
                    // eslint-disable-next-line
                    console.log(tx);
                })
                .catch(err => {
                    // eslint-disable-next-line
                    console.error(err);
                })
        },
        async changeRule() {
            const rule = await this.contract.methods.rules(this.changeRuleId).call();
            this.showChangeRuleModal = false;
            return await this.contract.methods.startRulePoll(rule.id, this.changeRuleAmount)
                .send({ from: this.account.loom.address })
                .then(tx => {
                    console.log(tx);
                })
                .catch(err => {
                    // eslint-disable-next-line
                    console.error(err);
                })
        },
        onCreateRewardRule() {
            const rulesRef = firebase.database().ref(`pools/${this.poolAddress}/rules`);

            return rulesRef.child(this.newRule.slug).set({
                slug: this.newRule.slug,
                title: this.newRule.title,
                size: this.newRule.size,
                description: this.newRule.description,
                state: 'undefined',
            }).then(() => {

                return this.contract.methods.createRule(this.newRule.slug, this.newRule.size)
                    .send({ from: this.account.loom.address })
                    .then(async tx => {
                        const id = tx.events.RuleStateChanged.returnValues.id;
                        const rule = await this.contract.methods.rules(id).call();

                        rulesRef.child(rule.slug).update({
                            id: id,
                            state: RuleState[rule.state]
                        });

                        this.showCreateRuleModal = false;

                        return this.getRewardRules();
                    })
                    .catch(err => {
                        // eslint-disable-next-line
                        console.error(err);
                    });
            });
        },
        onTransferToPool() {
            const tokenAmount = new BN(this.transferToPoolAmount).mul(tokenMultiplier);

            this.poolDepositBusy = true;

            return this.contract.methods.deposit(tokenAmount.toString())
                .send({ from: this.account.loom.address })
                .then(async () => {
                    const THX = window.THX;
                    const token = THX.network.instances.token;
                    let balanceInWei;

                    balanceInWei = await token.methods.balanceOf(this.poolAddress).call();
                    this.balance.pool = new BN(balanceInWei).div(tokenMultiplier);

                    balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
                    this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                    this.$parent.$refs.header.updateBalance();

                    this.transferToPoolAmount = 0;
                    this.poolDepositBusy = false;
                });
        }
    }
}
</script>
