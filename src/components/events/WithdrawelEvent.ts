import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import BN from 'bn.js';
import { WithdrawelEvent, RewardPool } from '@/models/RewardPool';

const tokenMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'deposit',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class Deposit extends Vue {

    @Prop() public ev!: WithdrawelEvent;
    @Prop() public pool!: RewardPool;
    private amount!: string;

    public created() {
        this.amount = new BN(this.ev.amount).div(tokenMultiplier).toString();
    }
}
