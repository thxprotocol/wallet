import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BSpinner, BTab, BTabs, BListGroup, BModal } from 'bootstrap-vue';
import Rule from '../components/Rule.vue';
import Reward from '../components/Reward.vue';
import CDepositEvent from '@/components/events/DepositEvent.vue';
import CWithdrawelEvent from '@/components/events/WithdrawelEvent.vue';
import CRuleStateChanged from '@/components/events/RuleStateChangedEvent.vue';
import { Network } from '@/models/Network';
import { RewardPool, DepositEvent, WithdrawelEvent } from '@/models/RewardPool';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import EventService from '@/services/EventService';
import BN from 'bn.js';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';

const _ = require('lodash');
const tokenMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'PoolDetail',
    components: {
        'rule': Rule,
        'reward': Reward,
        'rulestatechanged-event': CRuleStateChanged,
        'withdrawel-event': CWithdrawelEvent,
        'deposit-event': CDepositEvent,
        'b-list-group': BListGroup,
        'b-tabs': BTabs,
        'b-tab': BTab,
        'b-spinner': BSpinner,
        'b-modal': BModal,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
        }),
    },
})
export default class PoolDetail extends Vue {

    get stream() {
        return _.orderBy(this.events, 'created').reverse();
    }
    public eventService: EventService = new EventService;
    public error: string = '';
    public loading: boolean = false;
    public poolService!: PoolService;
    public coinService: CoinService = new CoinService();
    public events: any[] = [];
    public isManager: boolean = false;
    public isMember: boolean = false;
    public pool: RewardPool | null = null;
    public rules: RewardRule[] | null = null;
    public input: any = {
        poolDeposit: 0,
        addMember: '',
        addManager: '',
        rule: {
            slug: '',
            title: '',
            description: '',
        },
    };
    private $network!: Network;
    private rewardRule: RewardRule | null = null;
    private rewardRulePoll: RewardRulePoll | null = null;

    public created() {
        this.loading = true;
        this.poolService = new PoolService();
        this.poolService.getRewardPool(this.$route.params.id)
            .then(async (pool: RewardPool) => {
                const balance = await this.coinService.getExtdevBalance(pool.address);

                this.pool = pool;
                this.pool.setBalance(balance);
                this.isMember = await pool.isMember(this.$network.extdev.account);
                this.isManager = await pool.isManager(this.$network.extdev.account);
                this.events = await this.poolService.getRewardPoolEvents(this.pool);

                this.loading = false;
            })
            .then(async () => {
                if (this.pool) {
                    this.rules = await this.poolService.getRewardRules(this.pool);
                }
            });

        this.eventService.listen('event.Deposited', (event: any) => this.onDeposited(event.detail));
        this.eventService.listen('event.Withdrawn', (event: any) => this.onWithdrawn(event.detail));
        this.eventService.listen('event.RuleStateChanged', (event: any) => this.onRuleStateChanged(event.detail));
        this.eventService.listen('event.RulePollCreated', (event: any) => this.onRulePollCreated(event.detail));
    }

    public async onDeposited(data: any) {
        const d = new DepositEvent(data);
        this.events.push(d);
        this.updateBalance();
    }

    public async onWithdrawn(data: any) {
        const w = new WithdrawelEvent(data);
        this.events.push(w);
        this.updateBalance();
    }

    public addManager() {
        this.loading = true;

        if (this.pool) {
            this.poolService.addManager(this.input.addManager, this.pool)
                .then(() => {
                    this.input.addManager = '';
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.loading = false;
                    this.error = err;
                });
        }
    }

    public onAddMember() {
        this.loading = true;

        if (this.pool) {
            this.poolService.addMember(this.input.addMember, this.pool)
                .then(() => {
                    this.input.addMember = '';
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.loading = false;
                    this.error = err;
                });
        }
    }

    public deposit() {
        this.loading = true;

        if (this.pool) {
            this.poolService.addDeposit(
                new BN(this.input.poolDeposit).mul(tokenMultiplier),
                this.pool,
            )
                .then(() => {
                    (this.$refs.modalDeposit as BModal).hide();
                    this.input.poolDeposit = 0;
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.loading = false;
                    this.error = err;
                });
        }
    }

    public addRewardRule(rule: any) {
        this.loading = true;

        if (this.pool && rule.slug) {
            this.poolService.addRewardRule(rule, this.pool)
                .then(() => {
                    (this.$refs.modalCreateRule as BModal).hide();
                    this.input.rule.slug = '';
                    this.input.rule.title = '';
                    this.input.rule.description = '';
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.error = err;
                    this.loading = false;
                });
        }


        // const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);
        //
        // this.loading = true;
        //
        // return rulesRef.child(this.newRule.slug).set({
        //     slug: this.newRule.slug,
        //     title: this.newRule.title,
        //     description: this.newRule.description,
        //     state: 'undefined',
        // }).then(() => {
        //     return this.contract.methods.createRule(this.newRule.slug)
        //         .send({ from: this.account.loom.address })
        //         .then(async (tx: any) => {
        //             const id = tx.events.RuleStateChanged.returnValues.id;
        //             const rule = await this.contract.methods.rules(id).call();
        //
        //             rulesRef.child(rule.slug).update({
        //                 id,
        //                 state: RuleState[rule.state],
        //             });
        //
        //             this.modal.createRule = false;
        //             this.loading = false;
        //
        //             return this.getRules();
        //         })
        //         .catch((err: string) => {
        //             this.loading = false;
        //             // eslint-disable-next-line
        //             console.error(err);
        //         });
        // });
    }


    public onRulePollCreated(data: any) {
        // this.stream.push({
        //     timestamp: parseInt(timestamp, 10),
        //     title: `Rule #${data.id} poll: ${new BN(data.proposedAmount).div(tokenMultiplier)} THX`,
        // });
    }

    // public onRulePollFinished(data: any, timestamp: string) {
    //     this.stream.push({
    //         timestamp: parseInt(timestamp),
    //         title: `Rule #${data.id} poll ${data.approved ? 'approved' : 'rejected'}`,
    //         variant: data.approved ? 'success' : 'danger',
    //     });
    // }
    //
    public onRuleStateChanged(data: any) {
        // this.stream.push({
        //     timestamp: parseInt(timestamp),
        //     title: `Rule #${data.id} set to ${RuleState[data.state]}`,
        // });
    }

    private async updateBalance() {
        if (this.pool) {
            const balance = await this.coinService.getExtdevBalance(this.pool.address);
            this.pool.setBalance(balance);
        }
    }
    //

    //
    // public onManagerAdded(data: any, timestamp: string) {
    //     this.stream.push({
    //         timestamp: parseInt(timestamp),
    //         title: `New manager promotion`,
    //         body: `${data.account}`,
    //     });
    // }
    //
    // public onMemberAdded(data: any, timestamp: string) {
    //     this.stream.push({
    //         timestamp: parseInt(timestamp),
    //         title: `New member added`,
    //         body: `${data.account}`,
    //     });
    // }
    //
    // // onRewardPollCreated(data: any, timestamp: string) {
    // //     this.stream.push({
    // //         timestamp: parseInt(timestamp),
    // //         title: `Reward poll started`,
    // //     });
    // // },
    // // onRewardPollFinished(data, timestamp) {
    // //     this.stream.push({
    // //         timestamp: parseInt(timestamp),
    // //         title: `Reward poll finished`,
    // //     });
    // // },
    //

}
