import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import BN from 'bn.js';
import { DepositEvent, RewardPool } from '@/models/RewardPool';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'deposit',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class Deposit extends Vue {
    @Prop() public ev!: DepositEvent;
    @Prop() public pool!: RewardPool;
}
