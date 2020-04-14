import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import BaseModal from './BaseModal.vue';
import { BButton, BAlert } from 'bootstrap-vue';
import PoolService from '@/services/PoolService';

@Component({
    name: 'ModalMembershipRequest',
    components: {
        'b-button': BButton,
        'base-modal': BaseModal,
    },
})
export default class ModalMembershipRequest extends Vue {
    private error: string = '';
    private loading: boolean = false;
    private input: string = '';
    private poolService: PoolService = new PoolService();

    @Prop() private pool!: RewardPool;

    private async cancel() {
        this.error = '';
        this.loading = false;
        this.$bvModal.hide('modalMembershipRequest');
    }

    private async request() {
        this.loading = true;
        this.poolService
            .requestMembership(this.$user.uid, this.input, this.pool)
            .then(() => {
                this.loading = false;
                this.$bvModal.hide('modalMembershipRequest');
            })
            .catch((e: string) => {
                this.error = e;
                this.loading = false;
            });
    }
}
