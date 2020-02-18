import { Component, Prop, Vue } from 'vue-property-decorator';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import EventService from '@/services/EventService';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import { IRewardPools, RewardPool } from '@/models/RewardPool';
import { DepositEvent, WithdrawelEvent } from '@/models/RewardPoolEvents';
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
        return _.sortBy(this.transactions, 'blockTime', 'asc');
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
                        this.transactions.push(new DepositEvent({event: d}, '0'));
                    }

                    for (let i = 0; i < wLength; i++) {
                        const d = await pools[address].withdrawelOf(this.$network.extdev.account, i);
                        this.transactions.push(new WithdrawelEvent({event: d}, '0'));
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
