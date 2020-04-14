import { BButton } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import CModal from './Modal.vue';
import { Account } from '@/models/Account';
import PoolService from '@/services/PoolService';

@Component({
    name: 'ModalPoolCreate',
    components: {
        'b-button': BButton,
        'c-modal': CModal,
    },
    computed: mapGetters({
        account: 'account',
    }),
})
export default class ModalPoolCreate extends Vue {
    private input: any = {
        poolName: '',
    };
    private loading: boolean = false;
    private account!: Account;
    private poolService: PoolService = new PoolService();
    private error = '';

    private resetInput() {
        this.input = {
            poolName: '',
        };
    }

    private async cancel() {
        this.resetInput();

        this.$bvModal.hide('modalPoolCreate');
    }

    private create() {
        this.loading = true;
        this.loading = true;
        this.poolService
            .createAndJoin(this.account.uid, this.input.poolName)
            .then(() => {
                this.loading = false;
                this.$bvModal.hide('modalPoolCreate');
                this.resetInput();
            })
            .catch((err: string) => {
                this.loading = false;
                this.error = err;
            });
    }
}
