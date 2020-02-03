import { Component, Prop, Vue } from 'vue-property-decorator';
import { BProgress, BSpinner, BCardText, BCard, BModal, BProgressBar } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import PoolService from '@/services/PoolService';
import { Reward } from '@/models/Reward';
import { RewardPool } from '@/models/RewardPool';

@Component({
    name: 'CReward',
    components: {
        'b-modal': BModal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
    },
})
export default class CReward extends Vue {
    public loading: boolean = false;
    public error: string = '';
    public now: number = Math.floor(new Date().getTime() / 1000);
    public input: any = {
        poll: {
            proposal: 0,
        },
    };

    private $network!: Network;
    private poolService: PoolService = new PoolService();

    @Prop() private reward!: Reward;
    @Prop() private pool!: RewardPool;
    @Prop() private isMember!: boolean;
    @Prop() private isManager!: boolean;

    public created() {
        this.reward.update();
    }

    public async withdraw() {
        this.loading = true;

        return await this.reward.contract.methods.withdraw()
            .send({ from: this.$network.extdev.account.address })
            .then(async (tx: any) => {
                this.loading = false;
                // eslint-disable-next-line
                console.log(tx);
            })
            .catch((err: string) => {
                this.loading = false;
                // eslint-disable-next-line
                console.error(err);
            });
    }
    public async finalizePoll() {
        this.loading = true;

        return await this.reward.contract.methods.tryToFinalize()
            .send({ from: this.$network.extdev.account.address })
            .then(async (tx: any) => {
                this.loading = false;
                this.reward.state = await this.reward.contract.methods.state().call();
                // eslint-disable-next-line
                console.log(tx);
            })
            .catch((err: string) => {
                this.loading = false;
                // eslint-disable-next-line
                console.error(err);
            });
    }
}
