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
import { Account } from '@/models/Account';
import { RewardPool } from '@/models/RewardPool';
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
    private $account!: Account;
    private $network!: Network;
    private rewardRule: RewardRule | null = null;
    private rewardRulePoll: RewardRulePoll | null = null;

    get stream() {
        return _.orderBy(this.events, 'blockTime', 'desc');
    }

    get sortedRewards() {
        const filtered = this.rewards.filter((reward: Reward) => {
            const isMyReward = (reward.beneficiaryAddress)
                ? reward.beneficiaryAddress.toLowerCase() === this.$network.extdev.account
                : false;
            return (reward.state === 'Pending') || ((reward.state === 'Approved') && isMyReward) || ((reward.state === 'Withdrawn') && isMyReward);
        });
        return _.orderBy(filtered, 'startTime', 'desc');
    }

    public created() {
        this.loading = true;
        this.poolService = new PoolService();
        this.poolService.getRewardPool(this.$route.params.id)
            .then(async (pool: RewardPool) => {
                const balance = await this.coinService.getExtdevBalance(pool.address);

                this.pool = pool;
                this.pool.setBalance(balance);

                await this.checkMember();
                await this.checkManager();

                this.loading = false;

                this.getRewardPoolEvents(this.pool);
                this.getRewards(this.pool);
                this.getRewardRules();

                for (const eventType of this.pool.eventTypes) {
                    this.eventService.listen(`event.${eventType}`, (event: any) => {
                        (this as any)[`on${eventType}`](event.detail);
                    });
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

    public async getRewardRules() {
        if (this.pool) {
            this.rules = await this.poolService.getRewardRules(this.pool);
        }
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
                    this.$account.getExtdevCoinBalance();
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
        this.updateBalance();
    }

    private onWithdrawn(data: any) {
        this.updateBalance();
    }

    private onRulePollCreated(data: any) {
        this.updateRule(data);
    }

    private onRulePollFinished(data: any) {
        this.updateRule(data);
    }

    private onRuleStateChanged(data: any) {
        this.updateRule(data);
    }

    private onManagerAdded(data: any) {
        this.checkManager();
    }

    private onManagerRemoved(data: any) {
        this.checkManager();
    }

    private onMemberAdded(data: any) {
        this.checkMember();
    }


    private onMemberRemoved(data: any) {
        this.checkMember();
    }

    private onRewardPollCreated(data: any) {
        if (this.pool) {
            this.getRewards(this.pool);
        }
    }

    private onRewardPollFinished(data: any) {
        this.updateReward(data);
    }

    private async checkMember() {
        if (this.pool) {
            this.isMember = await this.pool.isMember(this.$network.extdev.account);
        }
    }

    private async checkManager() {
        if (this.pool) {
            this.isManager = await this.pool.isManager(this.$network.extdev.account);
        }
    }

    private async updateReward(data: any) {
        if (this.rewards) {
            const reward = this.rewards.find((r: Reward) => {
                return (r.id === parseInt(data.reward, 10));
            });
            if (reward && this.pool) {
                const index = this.rewards.indexOf(reward);
                this.rewards[index] = await this.poolService.getReward(reward.id, this.pool);
            }
        }
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
