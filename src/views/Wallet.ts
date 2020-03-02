import { Component, Prop, Vue } from 'vue-property-decorator';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import EventService from '@/services/EventService';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import { Deposit, Withdrawel } from '@/models/RewardPool';
import { mapGetters } from 'vuex';
import _ from 'lodash';

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
        return _.orderBy(this.transactions, 'created', 'desc');
    }

    public async created() {
        this.coinService = new CoinService();
        this.poolService = new PoolService();

        this.loading = true;
        this.transactions = [];

        try {
            const pools = await this.poolService.getMyRewardPools();

            for (const address in pools) {
                if (pools[address]) {
                    const dLength = await pools[address].countDeposits(this.$network.extdev.account);
                    const wLength = await pools[address].countWithdrawels(this.$network.extdev.account);

                    for (let i = 0; i < dLength; i++) {
                        const d = await pools[address].depositOf(this.$network.extdev.account, i);
                        this.transactions.push(new Deposit(d));
                    }

                    for (let i = 0; i < wLength; i++) {
                        const w = await pools[address].withdrawelOf(this.$network.extdev.account, i);
                        this.transactions.push(new Withdrawel(w));
                    }
                }
            }

            this.loading = false;
        } catch (error) {
            console.error(error);
            this.loading = false;
        }
    }
}
