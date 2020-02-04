import firebase from 'firebase/app';
import 'firebase/database';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BSpinner, BTab, BTabs, BListGroup, BModal } from 'bootstrap-vue';
import CRewardRule from '../components/Rule.vue';
import CReward from '../components/Reward.vue';
import CDepositEvent from '@/components/events/DepositEvent.vue';
import CWithdrawelEvent from '@/components/events/WithdrawelEvent.vue';
import CRuleStateChangedEvent from '@/components/events/RuleStateChangedEvent.vue';
import CRulePollCreatedEvent from '@/components/events/RulePollCreatedEvent.vue';
import CRulePollFinishedEvent from '@/components/events/RulePollFinishedEvent.vue';
import CRewardPollCreatedEvent from '@/components/events/RewardPollCreatedEvent.vue';
import CRewardPollFinishedEvent from '@/components/events/RewardPollFinishedEvent.vue';
import CMemberAddedEvent from '@/components/events/MemberAddedEvent.vue';
import CMemberRemovedEvent from '@/components/events/MemberRemovedEvent.vue';
import CManagerAddedEvent from '@/components/events/ManagerAddedEvent.vue';
import CManagerRemovedEvent from '@/components/events/ManagerRemovedEvent.vue';
import { Network } from '@/models/Network';
import {
    RewardPool,
    DepositEvent,
    WithdrawelEvent,
    RulePollCreatedEvent,
    RulePollFinishedEvent,
    RuleStateChangedEvent,
    MemberAddedEvent,
    MemberRemovedEvent,
    ManagerAddedEvent,
    ManagerRemovedEvent,
    RewardPollCreatedEvent,
    RewardPollFinishedEvent,
} from '@/models/RewardPool';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import EventService from '@/services/EventService';
import BN from 'bn.js';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import { Reward } from '@/models/Reward';
import _ from 'lodash';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'PoolDetail',
    components: {
        'rule': CRewardRule,
        'reward': CReward,
        'rewardpollcreated-event': CRewardPollCreatedEvent,
        'rewardpollfinished-event': CRewardPollFinishedEvent,
        'rulepollcreated-event': CRulePollCreatedEvent,
        'rulepollfinished-event': CRulePollFinishedEvent,
        'rulestatechanged-event': CRuleStateChangedEvent,
        'memberadded-event': CMemberAddedEvent,
        'memberremoved-event': CMemberRemovedEvent,
        'manageradded-event': CManagerAddedEvent,
        'managerremoved-event': CManagerRemovedEvent,
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
    public eventService: EventService = new EventService();
    public error: string = '';
    public loading: boolean = false;
    public poolService!: PoolService;
    public coinService: CoinService = new CoinService();
    public events: any = [];
    public isManager: boolean = false;
    public isMember: boolean = false;
    public pool: RewardPool | null = null;
    public rules: RewardRule[] | null = null;
    public rewards: Reward[] = [];
    public input: any = {
        poolDeposit: 0,
        addMember: '',
        addManager: '',
        rule: {
            title: '',
            description: '',
        },
    };
    private $network!: Network;
    private rewardRule: RewardRule | null = null;
    private rewardRulePoll: RewardRulePoll | null = null;

    get stream() {
        return _.orderBy(this.events, 'blockTime', 'desc');
    }

    get sortedRewards() {
        return _.orderBy(this.rewards, 'startTime', 'desc');
    }

    public created() {
        this.loading = true;
        this.poolService = new PoolService();
        this.poolService.getRewardPool(this.$route.params.id)
            .then(async (pool: RewardPool) => {
                const balance = await this.coinService.getExtdevBalance(pool.address);

                this.pool = pool;
                this.pool.setBalance(balance);

                this.isMember = await this.pool.isMember(this.$network.extdev.account);
                this.isManager = await this.pool.isManager(this.$network.extdev.account);

                this.loading = false;

                this.getRewardPoolEvents(this.pool);
                this.getRewards(this.pool);

            })
            .then(async () => {
                if (this.pool) {
                    this.rules = await this.poolService.getRewardRules(this.pool);
                }
            });
    }

    public async getRewardPoolEvents(pool: RewardPool) {
        firebase.database().ref(`pools/${pool.address}/events`)
            .limitToLast(15)
            .on('child_added', async (snap: any) => {
                const data = snap.val();

                if (data.hash) {
                    for (const type of pool.eventTypes) {
                        const logs = await this.poolService.getRewardPoolEventDataFromHash(data.hash, type);

                        if (logs) {
                            const model = this.poolService.getEventModel(type, logs, data.hash);

                            this.events.push(model);
                        }
                    }
                } else {
                    await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`).remove();
                }
            });
    }

    public async getRewards(pool: RewardPool) {
        const length = await pool.contract.methods.countRewards().call({ from: this.$network.extdev.account });

        for (let i = parseInt(length, 10) - 1; i >= 0; i--) {
            const r = await this.poolService.getReward(i, pool);

            this.rewards.push(r);
        }
    }

    public addMember() {
        this.loading = true;

        if (this.pool) {
            this.poolService.addMember(this.input.addMember, this.pool)
                .then(() => {
                    (this.$refs.modalAddMember as BModal).hide();
                    this.input.addMember = '';
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.loading = false;
                    this.error = err;
                });
        }
    }

    public addManager() {
        this.loading = true;

        if (this.pool) {
            this.poolService.addManager(this.input.addManager, this.pool)
                .then(() => {
                    (this.$refs.modalAddManager as BModal).hide();
                    this.input.addManager = '';
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
                new BN(this.input.poolDeposit).mul(TOKEN_MULTIPLIER),
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

        if (this.pool) {
            this.poolService.addRewardRule(rule, this.pool)
                .then(() => {
                    (this.$refs.modalCreateRule as BModal).hide();
                    this.input.rule.title = '';
                    this.input.rule.description = '';
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.error = err;
                    this.loading = false;
                });
        }
    }

    private onDeposited(data: any) {
        const r = new DepositEvent(data, data.blockTime);
        this.events.push(r);

        this.updateBalance();
    }

    private onWithdrawn(data: any) {
        const r = new WithdrawelEvent(data, data.blockTime);
        this.events.push(r);

        this.updateBalance();
    }

    private onRulePollCreated(data: any) {
        const r = new RulePollCreatedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private onRulePollFinished(data: any) {
        const r = new RulePollFinishedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private onRuleStateChanged(data: any) {
        const r = new RuleStateChangedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private onManagerAdded(data: any) {
        const r = new ManagerAddedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private onManagerRemoved(data: any) {
        const r = new ManagerRemovedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private onMemberAdded(data: any) {
        const r = new MemberAddedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private onMemberRemoved(data: any) {
        const r = new MemberRemovedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private onRewardPollCreated(data: any) {
        const r = new RewardPollCreatedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private onRewardPollFinished(data: any) {
        const r = new RewardPollFinishedEvent(data, data.blockTime);
        this.events.push(r);

        this.updateRule(data);
    }

    private async updateRule(data: any) {
        if (this.rules) {
            const rule = this.rules.find((r: RewardRule) => {
                return (r.id === parseInt(data.id, 10));
            });
            if (rule && this.pool) {
                const index = this.rules.indexOf(rule);
                this.rules[index] = await this.poolService.getRewardRule(rule.id, this.pool);
            }
        }
    }

    private async updateBalance() {
        if (this.pool) {
            const balance = await this.coinService.getExtdevBalance(this.pool.address);

            this.pool.setBalance(balance);
        }
    }
}
