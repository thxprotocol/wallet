import { Component, Vue } from 'vue-property-decorator';
import { BButton } from 'bootstrap-vue';
import { mapGetters } from 'vuex';
import BaseModal from '@/components/modals/BaseModal.vue';
import { Account } from '@/models/Account';
import PoolService from '@/services/PoolService';

@Component({
    name: 'ModalPoolJoin',
    components: {
        'b-button': BButton,
        'base-modal': BaseModal,
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
        this.$bvModal.hide('ModalPoolJoin');
    }

    private join() {
        this.loading = true;
        this.poolService
            .join(this.account.uid, this.input.poolAddress)
            .then(() => {
                this.loading = false;
                this.$bvModal.hide('ModalPoolJoin');
                this.resetInput();
            })
            .catch((err: string) => {
                this.loading = false;
                this.error = err;
            });
    }
}
