import { Component, Prop, Vue } from 'vue-property-decorator';
import { BCard, BCardText, BSpinner, BModal } from 'bootstrap-vue';
import NetworkService from '@/services/NetworkService';
import BN from 'bn.js';
import { mapGetters } from 'vuex';
import { Account } from '@/models/Account';
import PoolService from '@/services/PoolService';

@Component({
    name: 'pools',
    components: {
        'b-modal': BModal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
            account: 'account',
        }),
    },
})
export default class Pools extends Vue {
    public loading: boolean = false;
    public error: string = '';
    public input: any = {
        poolAddress: '',
    };
    public clipboard: any = null;
    private account!: Account;
    private $network!: NetworkService;
    private poolService: PoolService = new PoolService();

    private copyClipboard(value: string) {
        const input = document.createElement('input');

        input.setAttribute('id', 'clippy');
        input.setAttribute('type', 'text');
        input.setAttribute('value', value);
        input.setAttribute('style', 'display: block; opacity: 0;');

        (document as any).getElementById('app').appendChild(input);
        (document as any).getElementById('clippy').select();
        (document as any).execCommand('copy');
        (document as any).getElementById('clippy').remove();

        this.clipboard = value;
    }

    private joinRewardPool(address: string) {
        this.loading = true;
        this.poolService.join(this.account.uid, address)
            .then(() => {
                this.loading = false;
                (this.$refs.modalJoinPool as BModal).hide();
            })
            .catch((err: string) => {
                this.loading = false;
                this.error = err;
            });
    }

    private leaveRewardPool(poolAddress: string) {
        this.poolService.leave(this.account.uid, poolAddress)
            .then(() => {
                this.$store.commit('removeRewardPool', poolAddress);
            })
            .catch((err: string) => {
                this.error = err;
            });
    }
}
