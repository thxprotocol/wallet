import { Component, Vue } from 'vue-property-decorator';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { IRewardPools } from '@/models/RewardPool';
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
            rewardPools: 'pools/allWithMembership',
        }),
    },
})
export default class Wallet extends Vue {
    public error: string = '';
    public loading: boolean = false;
    private rewardPools!: IRewardPools;

    get allPoolTransactions() {
        let transfers: any[] = [];

        for (const address in this.rewardPools) {
            if (this.rewardPools[address]) {
                const pool = this.rewardPools[address];

                transfers = [...transfers, ...pool.transactions];
            }
        }

        return transfers;
    }

    get sortedTransactions() {
        return _.orderBy(this.allPoolTransactions, 'created', 'desc');
    }
}
