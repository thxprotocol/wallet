import { Component, Prop, Vue } from 'vue-property-decorator';
import { BModal, BCard, BCardText, BSpinner, BProgress, BProgressBar } from 'bootstrap-vue';
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

    public async created() {
        if (this.rule.hasPollAddress) {
            this.poll = await this.poolService.getRewardRulePoll(this.rule);
            this.update();
        }
    }

    public async update() {
        if (this.poll) {
            this.poll.update();
        }
        this.now = await this.$network.now();
    }

    public async startRulePoll() {
        this.loading = true;
        this.poolService.addRewardRulePoll(
            this.rule,
            this.pool,
            new BN(this.input.poll.proposal).mul(TOKEN_MULTIPLIER),
            )
            .then(async (tx: any) => {
                const rule: RewardRule = await this.poolService.getRewardRule(this.rule.id, this.pool);

                this.rule.pollAddress = rule.pollAddress;
                this.poll = await this.poolService.getRewardRulePoll(rule);
                this.loading = false;
                this.input.proposal = 0;

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
                    if (this.poll) {
                        this.poll.update();
                    }
                })
                .catch((err: string) => {
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
                    if (this.poll) {
                        this.poll.update();
                    }
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
                    this.rule = await this.poolService.getRewardRule(
                        this.rule.id,
                        this.pool,
                    );
                    this.loading = false;
                })
                .catch((err: string) => {
                    console.error(err);
                    this.error = err;
                    this.loading = false;
                });
        }
    }
}
