import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BSpinner, BTab, BTabs, BListGroup, BModal } from 'bootstrap-vue';
import CRewardRule from '@/components/Rule.vue';
import CReward from '@/components/Reward.vue';
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
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import EventService from '@/services/EventService';
import NetworkService from '@/services/NetworkService';
import { RewardPool, IRewardPools } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import { IRewards } from '@/models/Reward';
import BN from 'bn.js';
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
    public $events!: EventService;
    public error: string = '';
    public loading: boolean = false;
    public poolService!: PoolService;
    public coinService: CoinService = new CoinService();
    public events: any = [];
    public isManager: boolean = false;
    public isMember: boolean = false;
    public rules: RewardRule[] | null = null;
    public rewards: IRewards = {};
    public input: any = {
        poolDeposit: 0,
        addMember: '',
        addManager: '',
        rule: {
            title: '',
            description: '',
        },
    };
    private rewardPools!: IRewardPools;
    private $network!: NetworkService;

    get stream() {
        return _.orderBy(this.pool.events, 'blockTime', 'desc');
    }

    get pool(): RewardPool {
        return this.rewardPools[this.$route.params.id];
    }

    public updateRole(account: string, role: string, hasRole: boolean) {
        let promise;

        this.loading = true;

        if (role === 'Member') {
            promise = (hasRole)
                ? this.pool.removeMember(account)
                : this.pool.addMember(account);
            this.input.memberAddress = '';

        }
        if (role === 'Manager') {
            promise = (hasRole)
                ? this.pool.removeManager(account)
                : this.pool.addManager(account);
            this.input.managerAddress = '';
        }
        if (promise) {
            promise
                .then(() => {
                    (this.$refs.modalAddMember as BModal).hide();
                    (this.$refs.modalAddManager as BModal).hide();
                    (this.$refs.modalRemoveMember as BModal).hide();
                    (this.$refs.modalRemoveManager as BModal).hide();

                    this.loading = false;
                })
                .catch((err: string) => {
                    this.loading = false;
                    this.error = err;
                });
        }
    }

    public async deposit() {
        const amount = new BN(this.input.poolDeposit).mul(TOKEN_MULTIPLIER);
        const address = this.$network.extdev.account;
        const balanceWei = await this.coinService.getExtdevBalance(address);
        const balance = new BN(balanceWei).mul(TOKEN_MULTIPLIER);

        if (parseInt(balance.toString(), 10) >= parseInt(amount.toString(), 10)) {
            this.loading = true;

            this.pool.addDeposit(amount)
                .then(() => {
                    (this.$refs.modalDeposit as BModal).hide();

                    this.input.poolDeposit = 0;
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.loading = false;
                    this.error = err;
                });
        } else {
            this.error = 'Your balance is not sufficient.';
        }
    }

    public addRewardRule(rule: any) {
        this.loading = true;

        if (this.pool) {
            this.pool.addRewardRule(rule)
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

}
