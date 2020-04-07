import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import CModal from './Modal.vue';
import { BButton } from 'bootstrap-vue';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'ModalRulePollCreate',
    components: {
        'b-button': BButton,
        'c-modal': CModal,
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

    public async startRulePoll() {
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
