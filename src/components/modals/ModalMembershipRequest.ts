import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import BaseModal from './BaseModal.vue';
import { BButton, BAlert } from 'bootstrap-vue';

@Component({
    name: 'ModalMembershipRequest',
    components: {
        'b-button': BButton,
        'base-modal': BaseModal,
    },
})
export default class ModalMembershipRequest extends Vue {
    @Prop() private pool!: RewardPool;

    private error: string = '';
    private loading: boolean = false;
    private input: string = '';

    private async cancel() {
        this.error = '';
        this.loading = false;
        this.$bvModal.hide('modalMembershipRequest');
    }

    private async request() {
        this.loading = true;
        this.pool
            .requestMembership(this.$network.extdev.account, this.input, this.pool)
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
