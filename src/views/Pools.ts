import { Component, Vue } from 'vue-property-decorator';
import { BCard, BCardText, BSpinner, BButton } from 'bootstrap-vue';
import { mapGetters } from 'vuex';
import { Account } from '@/models/Account';
import PoolService from '@/services/PoolService';
import ModalPoolCreate from '@/components/modals/ModalPoolCreate.vue';
import ModalPoolJoin from '@/components/modals/ModalPoolJoin.vue';

@Component({
    name: 'pools',
    components: {
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'modal-pool-create': ModalPoolCreate,
        'modal-pool-join': ModalPoolJoin,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters({
            rewardPools: 'pools/allWithMembership',
        }),
    },
})
export default class Pools extends Vue {
    public loading: boolean = false;
    public error: string = '';
    public clipboard: any = null;
    private account!: Account;
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

    private leaveRewardPool(poolAddress: string) {
        this.poolService
            .leave(this.account.uid, poolAddress)
            .then(() => {
                this.$store.commit('removeRewardPool', poolAddress);
            })
            .catch((err: string) => {
                this.error = err;
            });
    }
}
