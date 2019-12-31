import { Component, Vue } from 'vue-property-decorator';
import Rules from '../components/Rules.vue';
import Rewards from '../components/Rewards.vue';
import Modal from '../components/Modal.vue';
import { BSpinner, BTab, BTabs, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import PoolService from '@/services/PoolService';
import { RewardPool } from '@/models/RewardPool';
import CoinService from '@/services/CoinService';
import { mapGetters } from 'vuex';

const _ = require('lodash');
const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

const RuleState = ['Active', 'Disabled'];
// const RewardState = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];

@Component({
    name: 'pool',
    components: {
        Modal,
        Rules,
        Rewards,
        BSpinner,
        BTabs,
        BTab,
        BListGroup,
        BListGroupItem,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
        })
    }
})
export default class Pool extends Vue {
    private $network!: Network;

    public error: string = '';
    public loading: boolean = false;
    public poolService!: PoolService;
    public coinService: CoinService = new CoinService();
    public stream: any[] = [];
    public isManager: boolean = false;
    public isMember: boolean = false;
    public pool: RewardPool | null = null;
    public input: any = {
        poolDeposit: 0,
        addMember: '',
        addManager: '',
    };
    public modal: any = {
        addMember: false,
        addManager: false,
        poolDeposit: false,
    };

    get orderedStream() {
        return _.orderBy(this.stream, 'timestamp').reverse();
    }

    created() {
        this.poolService = new PoolService();
        this.poolService.getRewardPool(this.$route.params.id)
            .then(async (pool: RewardPool) => {
                const balance = await this.coinService.getExtdevBalance(pool.address);

                pool.setBalance(balance);

                this.pool = pool;
            });


        // for (const e of this.events.poolEvents) {

        // This should be done with stored history somehow
        // this.contract.getPastEvents(e, { fromBlock: receipt.blockNumber, toBlock: 'latest'})
        //     .then((events: any[]) => {
        //         if (events.length > 0) {
        //             for (const event of events) {
        //                 this[`on${event.event}`](event.returnValues, event.blockTime);
        //             }
        //         }
        //     })
        //     .catch((err: string) => {
        //         // eslint-disable-next-line
        //         console.error(err);
        //     });
        // }
    }

    public onRulePollCreated(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp, 10),
            title: `Rule #${data.id} poll: ${new BN(data.proposedAmount).div(tokenMultiplier)} THX`,
        });
    }

    public onRulePollFinished(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `Rule #${data.id} poll ${data.approved ? 'approved' : 'rejected'}`,
            variant: data.approved ? 'success' : 'danger',
        });
    }

    public onRuleStateChanged(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `Rule #${data.id} set to ${RuleState[data.state]}`,
        });
    }

    public onDeposited(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `+${new BN(data.amount).div(tokenMultiplier)} THX (Deposit)`,
            body: `${data.sender}`,
            variant: 'success',
        });
    }

    public onWithdrawn(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `-${new BN(data.amount).div(tokenMultiplier)} THX (Withdrawel)`,
            body: `${data.sender}`,
            variant: 'danger',
        });
    }

    public onManagerAdded(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `New manager promotion`,
            body: `${data.account}`,
        });
    }

    public onMemberAdded(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `New member added`,
            body: `${data.account}`,
        });
    }

    // onRewardPollCreated(data: any, timestamp: string) {
    //     this.stream.push({
    //         timestamp: parseInt(timestamp),
    //         title: `Reward poll started`,
    //     });
    // },
    // onRewardPollFinished(data, timestamp) {
    //     this.stream.push({
    //         timestamp: parseInt(timestamp),
    //         title: `Reward poll finished`,
    //     });
    // },

    public onAddManager() {
        this.loading = true;

        if (this.pool) {
            return this.pool.addManager(this.input.addManager)
                .then(() => {
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
            return this.pool.addMember(this.input.addMember)
                .then(() => {
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.error = err;
                });
        }
    }

    public onTransferToPool() {
        const tokenAmount = new BN(this.input.poolDeposit).mul(tokenMultiplier);

        this.loading = true;

        // return this.contract.methods.deposit(tokenAmount.toString())
        //     .send({ from: this.account.loom.address })
        //     .then(async () => {
        //         const token = await this.$network.getExtdevCoinContract(
        //             this.$network.extdev.web3js,
        //         );
        //
        //         this.pool.balance = new BN(await token.methods.balanceOf(this.pool.address).call()).div(tokenMultiplier);
        //         this.input.poolDeposit = 0;
        //         this.loading = false;
        //
        //         (this.$parent.$refs.header as any).updateBalance();
        //     });
    }
}
