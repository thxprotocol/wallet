import { Component, Prop, Vue } from 'vue-property-decorator';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';
import NetworkService from '@/services/NetworkService';
import { Deposit, Withdrawel, IRewardPools } from '@/models/RewardPool';
import { mapGetters } from 'vuex';
import _ from 'lodash';
import store from '@/store';

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
    public $store: any = store;
    public error: string = '';
    public loading: boolean = false;

    private $network!: NetworkService;
    private transactions: any[] = [];
    private rewardPools!: IRewardPools;

    get sortedTransactions() {
        for (const address in this.rewardPools) {
            if (this.rewardPools[address]) {
                const pool = this.rewardPools[address];
                this.transactions = pool.transactions;
            }
        }

        return _.orderBy(this.transactions, 'created', 'desc');
    }
}
