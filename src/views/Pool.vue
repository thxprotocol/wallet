<template>
    <article class="region region--container">
        <main class="region region--content">
            <div class="region region--jumbotron">
                Pool size: <strong class="font-size-xl">{{this.balance.pool}} THX</strong>
                <h1>{{ pool.name }}</h1>
                <p>Curabitur sollicitudin nulla vitae sem ultricies cursus. In lectus lorem, sagittis quis fermentum ut, varius et dui. In posuere lacus vitae mollis lacinia.</p>
            </div>

            <h2>Reward Rules</h2>
            <ul class="list list--dotted">
                <li v-bind:key="rule.id" v-for="rule in rules">
                    {{ rule.id }}<br>
                    {{ rule.slug }}<br>
                    {{ rule.amount }}<br>
                    {{ rule.creator }}<br>
                    {{ rule.created }}<br>
                    {{ rule.key }}<br>
                    {{ RuleState[rule.state] }}<br>
                </li>
            </ul>

            <h2>Pool Actions</h2>
            <ul class="list-bullets">
                <li><button class="btn btn-link" v-if="isManager" @click="showCreateRuleModal = true">Add new rule</button></li>
                <li><button class="btn btn-link" @click="showChangeRuleModal = true">Change Rule</button></li>
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
                    <button @click="onAddRewardRule()" v-bind:class="{ disabled: createRuleBusy }" class="btn btn--success">Add new rule</button>
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
import StateService from '../services/StateService';
import EventService from '../services/EventService';

import modal from '../components/Modal';

const THX = window.THX;
const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'pool',
    components: {
        modal
    },
    data: function() {
        return {
            state: new StateService(),
            ea: new EventService(),
            isManager: false,
            pool: {},
            rules: [],
            RuleState: ['Pending', 'Active', 'Disabled'],
            showCreateRuleModal: false,
            createRuleBusy: false,
            showTransferToPoolModal: false,
            poolDepositBusy: false,
            transferToPoolAmount: 0,
            account: {
                loomAddress: null
            },
            newRule: {
                slug: '',
                title: '',
                description: '',
                size: 0,
            },
            pool: {
                name: '',
            },
            balance: {
                token: 0,
                pool: 0,
            }
        }
    },
    mounted() {
        const uid = firebase.auth().currentUser.uid;
        const loomKey = (typeof this.state.getItem('loomPrivateKey') !== "undefined") ? this.state.getItem('loomPrivateKey') : null;
        const ethKey = (typeof this.state.getItem('ethPrivateKey') !== "undefined") ? this.state.getItem('ethPrivateKey') : null;

        this.poolAddress = this.$route.params.id;

        firebase.database().ref(`pools/${uid}/${this.poolAddress}`).once('value').then((s) => {
            this.pool = s.val();
        });

        if (loomKey && ethKey) this.init(uid, loomKey, ethKey);
    },
    methods: {
        async init(uid, loomKey, ethKey) {
            let token, pool, balanceInWei;

            await THX.contracts.load(loomKey, ethKey);

            token = THX.contracts.instances.token;
            pool = THX.contracts.instances.pool;

            this.account.loomAddress = THX.contracts.loomAddress;

            this.getPoolMetadata();

            balanceInWei = await token.methods.balanceOf(pool._address).call();
            this.balance.pool = new BN(balanceInWei).div(tokenMultiplier);

            balanceInWei = await token.methods.balanceOf(this.account.loomAddress).call();
            this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

            this.isManager = await pool.methods.isManager(this.account.loomAddress).call();

            this.$parent.$refs.header.updateBalance();

            this.getRewardRules();

            this.ea.listen('event.RuleStateChanged', this.onRuleStateChanged)
        },
        onRuleStateChanged(rule) {
            const rulesRef = firebase.database().ref(`pools/${uid}/${this.poolAddress}/rules`);

            return rulesRef.child(rule.id).update({ state: this.RuleState[rule.state] });
        },
        async getPoolMetadata() {
            const pool = THX.contracts.instances.pool;
            this.pool.name = await pool.methods.name().call();
        },
        async getRewardRules() {
            const pool = THX.contracts.instances.pool;
            const amountOfRules = parseInt( await pool.methods.countRules().call() );

            for (let i = 0; i < amountOfRules; i++) {
                const rule = await pool.methods.rules(i).call();

                this.rules.push(rule);
            }
        },
        onAddRewardRule() {
            const pool = THX.contracts.instances.pool;
            const uid = firebase.auth().currentUser.uid;
            const rulesRef = firebase.database().ref(`pools/${uid}/${this.poolAddress}/rules`);

            return pool.methods.addRule(this.newRule.slug, this.newRule.size)
                .send({ from: this.account.loomAddress })
                .then(async tx => {
                    const id = tx.events.RuleStateChanged.returnValues;
                    const rule = await pool.methods.rules(id).call();

                    return rulesRef.child(id).set({
                        id: rule.id,
                        slug: rule.slug,
                        title: this.newRule.title,
                        description: this.newRule.description,
                        state: this.RuleState[rule.state],
                    }).then(async () => {
                        return this.showCreateRuleModal = false;
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        },
        onTransferToPool() {
            const pool = THX.contracts.instances.pool;
            const tokenAmount = new BN(this.transferToPoolAmount).mul(tokenMultiplier);

            this.poolDepositBusy = true;

            return pool.methods.deposit(tokenAmount.toString()).send({ from: this.account.loomAddress }).then(async () => {
                let balanceInWei;
                const token = THX.contracts.instances.token;

                balanceInWei = await token.methods.balanceOf(pool._address).call();
                this.balance.pool = new BN(balanceInWei).div(tokenMultiplier);

                balanceInWei = await token.methods.balanceOf(this.account.loomAddress).call();
                this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                this.$parent.$refs.header.updateBalance();

                this.transferToPoolAmount = 0;
                this.poolDepositBusy = false;
            });
        },
        onAddRewardPool() {
            const uid = firebase.auth().currentUser.uid;

            firebase.database().ref('pools').child(uid).once('value').then((s) => {
                this.account.uid = s.val().uid;
                this.account.email = s.val().email;
            });
        },
    }
}
</script>
