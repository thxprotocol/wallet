<template>
    <article class="region region--container">
        <main class="region region--content">
            <div class="region region--jumbotron">
                Pool size: <strong class="font-size-xl">{{this.balance.pool}} THX</strong>
                <h1>{{ pool.name }}</h1>
                <p>Curabitur sollicitudin nulla vitae sem ultricies cursus. In lectus lorem, sagittis quis fermentum ut, varius et dui. In posuere lacus vitae mollis lacinia.</p>
            </div>

            <h2>Pool transfers</h2>
            <hr class="dotted">
            <div v-if="!orderedPoolTransfers.length">Loading pool transfers...</div>
            <ul class="list list--dotted" v-if="orderedPoolTransfers">
                <li v-bind:key="transfer.hash" v-for="transfer in orderedPoolTransfers">
                    <div class="description">
                        <div v-if="transfer.from">
                            <small>From: </small><span class="badge badge--default">{{transfer.from}}</span>
                        </div>
                        <div v-if="transfer.to">
                            <small>To: </small><span class="badge badge--default">{{transfer.to}}</span>
                        </div>
                        <small>{{ transfer.created }}</small>
                    </div>
                    <div class="actions">
                        <strong>{{transfer.amount}} THX</strong>
                    </div>
                </li>
            </ul>

            <h2>Reward Rules</h2>
            <ul class="list list--dotted">
                <li v-bind:key="rule.id" v-for="rule in rules">
                    <div class="description">
                        {{ rule.id }} | {{ rule.slug }} | {{ rule.amount }} <strong>{{ RuleState[rule.state] }}</strong>
                    </div>
                    <div class="actions">

                    </div>
                </li>
            </ul>

            <h2>Rule Poll</h2>
            <template v-if="poll">
                <h3>{{poll.rule.title}}</h3>
                <p>{{poll.rule.description}}</p>
                <p>Proposed amount: <strong>{{poll.proposedAmount}}</strong></p>
                <p>
                    Amount of votes: {{poll.totalVoted}}<br>
                    Yes: <strong>{{poll.yesCounter}}</strong> | No: <strong>{{poll.noCounter}}</strong>
                </p>
                <template v-if="isMember">
                    <button class="btn btn-primary" v-if="hasVoted" @click="onRevokeVoteForRule()">Revoke</button>
                    <button class="btn btn-primary" v-if="!hasVoted" @click="onRejectRewardRule()">Reject</button>
                    <button class="btn btn-primary" v-if="!hasVoted" @click="onApproveRewardRule()">Approve</button>
                </template>
                <p v-if="!isMember"><strong>You are not a member of this pool and can not join the poll.</strong></p>
            </template>

            <h2>Pool Actions</h2>
            <ul class="list-bullets">
                <li v-if="isManager"><button class="btn btn-link" @click="showCreateRuleModal = true">Add new rule</button></li>
                <li v-if="isMember"><button class="btn btn-link" @click="showChangeRuleModal = true">Change Rule</button></li>
                <li v-if="isMember"><button class="btn btn-link" @click="showAddMemberModal = true">Invite Member</button></li>
                <li><button class="btn btn-link" @click="showTransferToPoolModal = true">Pool Deposit</button></li>
            </ul>

            <modal v-if="showCreateRuleModal" @close="showCreateRuleModal = false">
                <h3 slot="header">Create reward rule:</h3>
                <div slot="body">
                    <template v-if="!createRuleBusy">
                        <label for="slug">Slug:</label>
                        <input id="slug" v-model="newRule.slug" type="text" placeholder="complete_profile"/>
                        <label for="title">Title:</label>
                        <input id="title" v-model="newRule.title" type="text" placeholder="Complete your profile!"/>
                        <label for="description">Description:</label>
                        <textarea width="100%" rows="3" id="description" v-model="newRule.description" placeholder="When filling all fields of your public profile you will receive the reward."> </textarea>
                        <label for="rewardSize">Reward size:</label>
                        <input id="rewardSize" v-model="newRule.size" type="number" />
                    </template>

                    <span v-if="createRuleBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onCreateRewardRule()" v-bind:class="{ disabled: createRuleBusy }" class="btn btn--success">Add new rule</button>
                </template>
            </modal>

            <modal v-if="showAddMemberModal" @close="showAddMemberModal = false">
                <h3 slot="header">Invite new member to the pool:</h3>
                <div slot="body">
                    <input v-if="!addMemberBusy" v-model="newMemberAddress" type="text" placeholder="0x0000000000000000000000000000000000000000">
                    <span v-if="addMemberBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onAddMember()" v-bind:class="{ disabled: addMemberBusy }" class="btn btn--success">Add member</button>
                </template>
            </modal>

            <modal v-if="showTransferToPoolModal" @close="showTransferToPoolModal = false">
                <h3 slot="header">Reward pool deposit:</h3>
                <div slot="body">
                    <p>Reward Pool balance: <strong>{{this.balance.pool}} THX</strong></p>
                    <input v-if="!poolDepositBusy" v-model="transferToPoolAmount" type="number" v-bind:max="balance.token" />
                    <span v-if="poolDepositBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onTransferToPool()" v-bind:class="{ disabled: poolDepositBusy }" class="btn btn--success">Deposit {{ transferToPoolAmount }} THX</button>
                </template>
            </modal>

            <modal v-if="showTransferToPoolModal" @close="showTransferToPoolModal = false">
                <h3 slot="header">Reward pool deposit:</h3>
                <div slot="body">
                    <p>Reward Pool balance: <strong>{{this.balance.pool}} THX</strong></p>
                    <input v-if="!poolDepositBusy" v-model="transferToPoolAmount" type="number" v-bind:max="balance.token" />
                    <span v-if="poolDepositBusy" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onTransferToPool()" v-bind:class="{ disabled: poolDepositBusy }" class="btn btn--success">Deposit {{ transferToPoolAmount }} THX</button>
                </template>
            </modal>
        </main>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventAggregator from '../services/EventAggregator';
import RewardPool from '../contracts/RewardPool.json';
import RulePoll from '../contracts/RulePoll.json';
import modal from '../components/Modal';

import Vue from 'vue';
const _ = require('lodash');

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'pool',
    components: {
        modal
    },
    computed: {
        orderedPoolTransfers: function () {
            return _.orderBy(this.poolTransfers, 'timestamp').reverse()
        }
    },
    data: function() {
        return {
            ea: new EventAggregator(),
            poolTransfers: null,
            isManager: false,
            isMember: false,
            rules: [],
            RuleState: ['Pending', 'Active', 'Disabled'],
            showCreateRuleModal: false,
            createRuleBusy: false,
            showTransferToPoolModal: false,
            poolDepositBusy: false,
            transferToPoolAmount: 0,
            showAddMemberModal: false,
            addMemberBusy: false,
            newMemberAddress: '',
            hasVoted: false,
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

            this.getRewardRules();
            this.getRulePoll();

            this.ea.listen('event.RuleStateChanged', this.onRuleStateChanged)
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
        async onApproveRewardRule() {
            return await this.contract.methods.voteForRule(true).send({from: this.account.loom.address });
        },
        async onRejectRewardRule() {
            return await this.contract.methods.voteForRule(false).send({from: this.account.loom.address });
        },
        async onRevokeVoteForRule() {
            return await this.contract.methods.revokeVoteForRule().send({from: this.account.loom.address });
        },
        onRuleStateChanged(data) {
            const rule = data.detail;
            const rulesRef = firebase.database().ref(`pools/${this.poolAddress}/rules`);

            if (this.rules[rule.id]) {
                Vue.set(this.rules[rule.id], 'state', rule.state);
            }

            return rulesRef.child(rule.id).update({ state: this.RuleState[rule.state] });
        },
        async getRewardRules() {
            const amountOfRules = parseInt( await this.contract.methods.countRules().call() );

            for (let i = 0; i < amountOfRules; i++) {
                const rule = await this.contract.methods.rules(i).call();

                Vue.set(this.rules, rule.id, rule);
            }
        },
        async getRulePoll() {
            const pollAddress = await this.contract.methods.rulePoll().call();

            if (pollAddress !== "0x0000000000000000000000000000000000000000") {
                const THX = window.THX;
                const rulePoll = THX.network.contract(RulePoll, pollAddress);

                const id = parseInt(await rulePoll.methods.id().call());
                const proposedAmount = parseInt(await rulePoll.methods.proposedAmount().call());

                const rulesRef = firebase.database().ref(`pools/${this.poolAddress}/rules`);
                const vote = await rulePoll.methods.votesByAddress(this.account.loom.address).call();

                this.hasVoted = parseInt(vote.time) > 0;

                rulesRef.child(id).once('value')
                    .then(async data => {
                        const yesCounter = await rulePoll.methods.yesCounter().call();
                        const noCounter = await rulePoll.methods.noCounter().call();
                        const totalVoted = await rulePoll.methods.totalVoted().call();

                        this.poll = {
                            id: id,
                            proposedAmount: proposedAmount,
                            yesCounter: new BN(yesCounter).div(tokenMultiplier),
                            noCounter: new BN(noCounter).div(tokenMultiplier),
                            totalVoted: totalVoted,
                            rule: {
                                title: data.val().title,
                                description: data.val().description,
                                state: this.RuleState[data.val().state],
                                amount: data.val().amount,
                            }
                        }
                    });
            }

        },
        onCreateRewardRule() {
            const rulesRef = firebase.database().ref(`pools/${this.poolAddress}/rules`);

            return this.contract.methods.createRule(this.newRule.slug, this.newRule.size)
                .send({ from: this.account.loom.address })
                .then(async tx => {
                    debugger
                    const id = tx.events.RuleStateChanged.returnValues.id;
                    const rule = await this.contract.methods.rules(id).call();

                    return rulesRef.child(id).set({
                        id: rule.id,
                        slug: rule.slug,
                        title: this.newRule.title,
                        description: this.newRule.description,
                        state: this.RuleState[rule.state],
                    }).then(() => {
                        return this.showCreateRuleModal = false;
                    });
                })
                .catch(err => {
                    // eslint-disable-next-line
                    console.error(err);
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
