<template>
    <article>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <th>#</th>
                    <th>slug</th>
                    <th>amount</th>
                    <th>actions</th>
                    <th>state</th>
                </thead>

                <Rule
                    v-bind:key="rule.id"
                    v-for="rule in rules"
                    v-bind:rule="rule"
                    v-bind:account="account"
                    v-bind:contract="contract"></Rule>

            </table>
        </div>

        <button class="btn btn-link" @click="getRewardRules()">Refresh</button>
        <button v-if="account.isManager" class="btn btn-primary" @click="modal.createRule = true">Add new rule</button>

        <Modal v-if="modal.createRule" @close="modal.createRule = false">
            <h3 slot="header">Create reward rule:</h3>
            <div slot="body" v-if="!loading">
                <label for="slug">Slug:</label>
                <input id="slug" v-model="newRule.slug" type="text" class="form-control" placeholder="complete_profile"/>
                <label for="title">Title:</label>
                <input id="title" v-model="newRule.title" type="text" class="form-control" placeholder="Complete your profile!"/>
                <label for="description">Description:</label>
                <textarea class="form-control"  width="100%" rows="3" id="description" v-model="newRule.description" placeholder="When filling all fields of your public profile you will receive the reward."> </textarea>
                <label for="rewardSize">Reward size:</label>
                <input id="rewardSize" v-model="newRule.size" type="number" class="form-control"  />
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="createRule()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Add new rule</button>
            </template>
        </Modal>

    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService';
import Vue from 'vue';
import Rule from './Rule';
import Modal from './Modal';
import { BSpinner } from 'bootstrap-vue';

const RuleState = ['Pending', 'Active', 'Disabled'];

export default {
    name: 'Rules',
    components: {
        Modal,
        Rule,
        BSpinner,
    },
    data: function() {
        return {
            loading: false,
            events: new EventService(),
            rules: [],
            modal: {
                createRule: false,
                changeRule: false,
            },
            newRule: {
                slug: '',
                title: '',
                description: '',
                size: 0,
            },
        }
    },
    props: {
        contract: null,
        account: {
            loom: {
                address: ''
            },
            isManager: false,
            isMember: false,
        }
    },
    mounted() {
        this.getRules();

        this.events.listen('event.RuleStateChanged', this.onRuleStateChanged);
        this.events.listen('event.RulePollCreated', this.onRulePollCreated);
        this.events.listen('event.RulePollFinished', this.onRulePollFinished);
    },
    methods: {
        async onRulePollCreated(data) {
            const r = data.detail;
            const rule = await this.contract.methods.rules(r.id).call();

            Vue.set(this.rules[rule.id], 'poll', rule.poll);
        },
        async onRulePollFinished(data) {
            const r = data.detail;
            const rule = await this.contract.methods.rules(r.id).call();

            Vue.set(this.rules[rule.id], 'poll', rule.poll);
            Vue.set(this.rules[rule.id], 'amount', rule.amount);
        },
        async onRuleStateChanged(data) {
            const r = data.detail;
            const rule = await this.contract.methods.rules(r.id).call();
            const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);

            if (this.rules[rule.id]) {
                Vue.set(this.rules[rule.id], 'state', RuleState[rule.state]);
            }

            rulesRef.child(rule.slug).update({ state: RuleState[rule.state] })
        },
        createRule() {
            const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);

            this.loading = true;

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

                        this.modal.createRule = false;
                        this.loading = false;

                        return this.getRules();
                    })
                    .catch(err => {
                        this.loading = false;
                        // eslint-disable-next-line
                        console.error(err);
                    });
            });
        },
        async getRules() {
            const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);
            // Check the firebase for objects that are not in contracts and vice versa.
            // TODO index the id and not the slug

            const amountOfRules = parseInt( await this.contract.methods.countRules().call() );

            for (let i = 0; i < amountOfRules; i++) {
                const rule = await this.contract.methods.rules(i).call();

                Vue.set(this.rules, rule.id, {
                    amount: rule.amount,
                    created: rule.created,
                    creator: rule.creator,
                    id: rule.id,
                    slug: rule.slug,
                    state: RuleState[rule.state],
                    poll: rule.poll,
                });
            }
        }
    }
}
</script>
