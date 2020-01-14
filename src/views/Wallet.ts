import { Component, Prop, Vue } from 'vue-property-decorator';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import EventService from '@/services/EventService';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import { DepositEvent, WithdrawelEvent, IRewardPools, RewardPool } from '@/models/RewardPool';
import { mapGetters } from 'vuex';

@Component({
    name: 'wallet',
    components: {
        'b-spinner': BSpinner,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
        }),
    },
})
export default class Wallet extends Vue {
    public error: string = '';
    public $store: any;
    public loading: boolean = false;
    public events: any = new EventService();
    public poolService!: PoolService;
    public coinService!: CoinService;

    private transactions: any[] = [];
    private $network!: Network;

    get sortedTransactions() {
        const arr: any[] = [];
        for (const i in this.transactions) {
            if (this.transactions[i]) {
                arr.unshift(this.transactions[i]);
            }
        }

        return arr.reverse();
    }

    public async created() {
        this.coinService = new CoinService();
        this.poolService = new PoolService();

        this.loading = true;

        try {
            const pools = await this.poolService.getMyRewardPools();

            for (const address in pools) {
                if (pools[address]) {
                    const deposits = await pools[address].depositsOf(this.$network.extdev.account);
                    const withdrawels = await pools[address].withdrawelsOf(this.$network.extdev.account);

                    deposits.map((d: DepositEvent) => {
                        this.transactions.push(d);
                    });

                    withdrawels.map((w: WithdrawelEvent) => {
                        this.transactions.push(w);
                    });
                }
            }

            this.loading = false;
        } catch (error) {
            console.error(error);
            this.loading = false;
            this.error = `Oops! Your Reward Pools could not be loaded. Did you provide your keys?`;
        }
    }
}
