import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import CModal from './Modal.vue';
import { BButton } from 'bootstrap-vue';

@Component({
    name: 'ModalRewardGive',
    components: {
        'b-button': BButton,
        'c-modal': CModal,
    },
})
export default class ModalRewardGive extends Vue {
    @Prop() private pool!: RewardPool;
    @Prop() private rule!: RewardRule;

    private input: any = {
        beneficiary: '',
    };
    private loading: boolean = false;

    private created() {
        this.input.beneficiary = this.$network.extdev.account;
    }

    private async cancel() {
        this.input.beneficiary = '';

        this.$bvModal.hide('ModalRewardGive');
    }

    private createReward(id: number, beneficiary: string) {
        this.loading = true;
        this.pool
            .createReward(id, beneficiary)
            .then(() => {
                this.loading = false;
                this.$bvModal.hide('ModalRewardGive');
            })
            .catch(() => {
                this.loading = false;
            });
    }
}
