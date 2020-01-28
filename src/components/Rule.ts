import { Component, Prop, Vue } from 'vue-property-decorator';
import { BModal, BCard, BCardText, BSpinner, BProgress, BProgressBar } from 'bootstrap-vue';
import PoolDetail from '@/views/Pool.vue';
import { Network } from '@/models/Network';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import { RewardPool } from '@/models/RewardPool';
import PoolService from '@/services/PoolService';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'CRewardRule',
    components: {
        'b-modal': BModal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
    },
})
export default class CRewardRule extends Vue {
    public loading: boolean = false;
    public error: string = '';
    public now: number = Math.floor(new Date().getTime() / 1000);
    public input: any = {
        poll: {
            proposal: 0,
        },
    };
    public poll: RewardRulePoll | null = null;

    private $network!: Network;
    private poolService: PoolService = new PoolService();

    @Prop() private rule!: RewardRule;
    @Prop() private pool!: RewardPool;
    @Prop() private isMember!: boolean;
    @Prop() private isManager!: boolean;

    public created() {
        // this.updateRulePoll();
    }

    public async viewRunningPoll() {
        (this.$refs.modalRulePoll as BModal).show();

        this.updateRulePoll();
    }

    public async startRulePoll() {
        this.loading = true;
        this.poolService.addRewardRulePoll(
            this.rule,
            this.pool,
            new BN(this.input.poll.proposal).mul(TOKEN_MULTIPLIER),
            )
            .then(async (tx: any) => {
                this.input.proposal = 0;
                this.loading = false;
                this.updateRulePoll();
                (this.$refs.modalCreateRulePoll as BModal).hide();
            })
            .catch((err: string) => {
                console.error(err);
                this.error = err;
            });
    }

    public async vote(agree: boolean) {
        if (this.poll) {
            this.poll.loading = true;
            this.poolService.voteForRule(
                this.rule,
                this.pool,
                agree,
                )
                .then(async (tx: any) => {
                    this.updateRulePoll();
                })
                .catch((err: string) => {
                    console.error(err);
                    this.error = err;
                    if (this.poll) {
                        this.poll.loading = false;
                    }
                });
        }
    }

    public async revokeVote() {
        if (this.poll) {
            this.poll.loading = true;
            this.poolService.revokeVoteForRule(
                this.rule,
                this.pool,
                )
                .then(async (tx: any) => {
                    this.updateRulePoll();
                })
                .catch((err: string) => {
                    console.error(err);
                    this.error = err;
                });
        }
    }

    public async tryToFinalize() {
        this.loading = true;
        if (this.poll) {
            this.poolService.tryToFinalize(
                this.poll,
                this.pool,
                )
                .then(async (tx: any) => {
                    this.updateRulePoll();
                    (this.$refs.modalRulePoll as BModal).hide();
                    this.loading = false;
                })
                .catch((err: string) => {
                    console.error(err);
                    this.error = err;
                    this.loading = false;
                });
        }
    }

    private async updateRulePoll() {
        if (this.rule.pollAddress !== '0x0000000000000000000000000000000000000000') {
            this.now = await this.$network.now();
            this.poll = await this.poolService.getRewardRulePoll(this.rule);
        }
    }
}
