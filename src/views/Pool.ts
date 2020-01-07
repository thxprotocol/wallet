import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BSpinner, BTab, BTabs, BListGroup, BListGroupItem, BModal } from 'bootstrap-vue';
import Rules from '../components/Rules.vue';
import Rewards from '../components/Rewards.vue';
import ComponentDeposit from '@/components/Deposit.vue';
import { Network } from '@/models/Network';
import { Transaction, RewardPool, Deposit } from '@/models/RewardPool';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import EventService from '@/services/EventService';
import BN from 'bn.js';

const _ = require('lodash');
const tokenMultiplier = new BN(10).pow(new BN(18));

const RuleState = ['Active', 'Disabled'];
const RewardState = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];

@Component({
    name: 'pool',
    components: {
        'rules': Rules,
        'rewards': Rewards,
        'deposit': ComponentDeposit,
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
export default class Pool extends Vue {
    public eventService: EventService = new EventService;
    public error: string = '';
    public loading: boolean = false;
    public poolService!: PoolService;
    public coinService: CoinService = new CoinService();
    public events: any[] = [];
    public isManager: boolean = false;
    public isMember: boolean = false;
    public pool: RewardPool | null = null;
    public input: any = {
        poolDeposit: 0,
        addMember: '',
        addManager: '',
    };
    private $network!: Network;

    get stream() {
        return _.orderBy(this.events, 'created').reverse();
    }

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
            });

        this.eventService.listen('event.Deposited', (event: any) => this.onDeposited(event.detail));
        this.eventService.listen('event.Withdrawn', (event: any) => this.onWithdrawn(event.detail));
    }

    private async updateBalance() {
        if (this.pool) {
            const balance = await this.coinService.getExtdevBalance(this.pool.address);

            this.pool.setBalance(balance);
        }
    }

    public async onDeposited(data: any) {
        const deposit = new Deposit(data);
        this.events.push(deposit)
        this.updateBalance();
    }

    public async onWithdrawn(data: any) {
        this.updateBalance();
        // this.events.push({
        //     timestamp: parseInt(data.created),
        //     title: `-${new BN(data.amount).div(tokenMultiplier)} THX (Withdrawel)`,
        //     body: `${data.receiver}`,
        //     variant: 'danger',
        // });
    }

    // public onRulePollCreated(data: any, timestamp: string) {
    //     this.stream.push({
    //         timestamp: parseInt(timestamp, 10),
    //         title: `Rule #${data.id} poll: ${new BN(data.proposedAmount).div(tokenMultiplier)} THX`,
    //     });
    // }
    //
    // public onRulePollFinished(data: any, timestamp: string) {
    //     this.stream.push({
    //         timestamp: parseInt(timestamp),
    //         title: `Rule #${data.id} poll ${data.approved ? 'approved' : 'rejected'}`,
    //         variant: data.approved ? 'success' : 'danger',
    //     });
    // }
    //
    // public onRuleStateChanged(data: any, timestamp: string) {
    //     this.stream.push({
    //         timestamp: parseInt(timestamp),
    //         title: `Rule #${data.id} set to ${RuleState[data.state]}`,
    //     });
    // }
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
                    (this.$refs.modalDeposit as BModal).hide()
                    this.input.poolDeposit = 0;
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.loading = false;
                    this.error = err;
                });
        }
    }
}
