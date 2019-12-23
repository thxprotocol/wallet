import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService';
import Rule from './Rule';
import Modal from './Modal.vue';
import { BSpinner } from 'bootstrap-vue';

const RuleState = ['Active', 'Disabled'];
const THX = window.THX;

@Component({
    name: 'Rules',
    components: {
        Modal,
        Rule,
        BSpinner,
    },
})
export default class Rules extends Vue {
    public loading: any = false;
    public events: any = new EventService();
    public rules: any = [];
    public modal: any = {
        createRule: false,
        changeRule: false,
    };
    public newRule: any = {
        slug: '',
        title: '',
        description: '',
    };

    @Prop() public contract: any = null;
    @Prop() public account: any = {
        loom: {
            address: '',
        },
        isManager: false,
        isMember: false,
    };

    public mounted() {
        this.getRules();

        this.events.listen('event.RuleStateChanged', this.onRuleStateChanged);
        this.events.listen('event.RulePollCreated', this.onRulePollCreated);
        this.events.listen('event.RulePollFinished', this.onRulePollFinished);
    }

    public async onRulePollCreated(data: any) {
        const r = data.detail;
        const rule = await this.contract.methods.rules(r.id).call();

        Vue.set(this.rules[rule.id], 'poll', rule.poll);
    }

    public async onRulePollFinished(data: any) {
        const utils = THX.network.loom;
        const r = data.detail;
        const rule = await this.contract.methods.rules(r.id).call();
        const amount = utils.fromWei(rule.amount, 'ether');

        Vue.set(this.rules[rule.id], 'poll', rule.poll);
        Vue.set(this.rules[rule.id], 'amount', amount);
    }

    public async onRuleStateChanged(data: any) {
        const r = data.detail;
        const rule = await this.contract.methods.rules(r.id).call();
        const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);

        if (this.rules[rule.id]) {
            Vue.set(this.rules[rule.id], 'state', RuleState[rule.state]);
        }

        rulesRef.child(rule.slug).update({ state: RuleState[rule.state] });
    }

    public createRule() {
        const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);

        this.loading = true;

        return rulesRef.child(this.newRule.slug).set({
            slug: this.newRule.slug,
            title: this.newRule.title,
            description: this.newRule.description,
            state: 'undefined',
        }).then(() => {
            return this.contract.methods.createRule(this.newRule.slug)
                .send({ from: this.account.loom.address })
                .then(async (tx: any) => {
                    const id = tx.events.RuleStateChanged.returnValues.id;
                    const rule = await this.contract.methods.rules(id).call();

                    rulesRef.child(rule.slug).update({
                        id,
                        state: RuleState[rule.state],
                    });

                    this.modal.createRule = false;
                    this.loading = false;

                    return this.getRules();
                })
                .catch((err: string) => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.error(err);
                });
        });
    }

    public async getRules() {
        // const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);
        // Check the firebase for objects that are not in contracts and vice versa.
        // TODO index the id and not the slug
        const utils = THX.network.loom.utils;
        const amountOfRules = parseInt( await this.contract.methods.countRules().call() );

        for (let i = 0; i < amountOfRules; i++) {
            const rule = await this.contract.methods.rules(i).call();
            const amount = utils.fromWei(rule.amount, 'ether');

            Vue.set(this.rules, rule.id, {
                amount,
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
