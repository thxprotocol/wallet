import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import BN from 'bn.js';

const tokenMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'deposit',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class Deposit extends Vue {
    private amount!: string;

    @Prop() ev!: Deposit;

    created() {
        this.amount = new BN(this.ev.amount).div(tokenMultiplier).toString();
    }


}