import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import BaseModal from '@/components/modals/BaseModal.vue';
import { BButton } from 'bootstrap-vue';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'ModalRulePollCreate',
    components: {
        'b-button': BButton,
        'base-modal': BaseModal,
    },
})
export default class ModalRulePollCreate extends Vue {
    @Prop() private pool!: RewardPool;
    @Prop() private rule!: RewardRule;
    @Prop() private poll!: RewardRulePoll;

    private error: string = '';
    private input: any = {
        proposal: 0,
    };
    private loading: boolean = false;

    private async cancel() {
        this.input.proposal = 0;

        this.$bvModal.hide('modalRulePollCreate');
    }

    private async startRulePoll() {
        this.loading = true;

        this.pool
            .addRewardRulePoll(this.rule, new BN(this.input.proposal).mul(TOKEN_MULTIPLIER))
            .then(async () => {
                this.input.proposal = 0;
                this.loading = false;
                this.$bvModal.hide('modalRulePollCreate');
            })
            .catch((err: string) => {
                this.error = err;
                this.loading = false;
            });
    }
}
