import { Component, Vue } from 'vue-property-decorator';
import { BButton } from 'bootstrap-vue';
import { mapGetters } from 'vuex';
import CModal from './Modal.vue';
import { Account } from '@/models/Account';
import PoolService from '@/services/PoolService';

@Component({
    name: 'ModalPoolJoin',
    components: {
        'b-button': BButton,
        'c-modal': CModal,
    },
    computed: mapGetters({
        account: 'account',
    }),
})
export default class ModalPoolJoin extends Vue {
    private input: any = {
        poolAddress: '',
    };
    private loading: boolean = false;
    private account!: Account;
    private poolService: PoolService = new PoolService();
    private error = '';

    private resetInput() {
        this.input = {
            poolAddress: '',
        };
    }

    private cancel() {
        this.resetInput();
        this.$bvModal.hide('modalPoolJoin');
    }

    private join() {
        this.loading = true;
        this.poolService
            .join(this.account.uid, this.input.poolAddress)
            .then(() => {
                this.loading = false;
                this.$bvModal.hide('modalPoolJoin');
                this.resetInput();
            })
            .catch((err: string) => {
                this.loading = false;
                this.error = err;
            });
    }
}
