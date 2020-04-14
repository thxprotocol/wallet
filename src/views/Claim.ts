import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardPool, IRewardPools } from '@/models/RewardPool';
import firebase from 'firebase/app';
import StateService from '@/services/StateService';
import { RewardRule } from '@/models/RewardRule';
import PoolService from '@/services/PoolService';

const QRCode = (window as any).QRCode;

@Component({
    name: 'Claim',
})
export default class Claim extends Vue {
    public error: string = '';
    public pool: RewardPool | null = null;
    public rule: RewardRule | null = null;
    public confetti: any = [];
    public $state!: StateService;

    private data!: any;
    private isClaimed: boolean = false;
    private rewardPools!: IRewardPools;
    private poolService: PoolService = new PoolService();

    private async mounted() {
        if (this.$route.params.rule && this.$route.params.pool && this.$route.params.address) {
            const rewardsRef = firebase.database().ref(`pools/${this.$route.params.pool}/rewards`);

            this.data = {
                rule: parseInt(this.$route.params.rule, 10),
                pool: this.$route.params.pool,
                address: this.$route.params.address,
            };

            rewardsRef.child(this.data.key).set(this.data);

            rewardsRef.child(this.data.key).on('child_added', (s: any) => {
                if (s.key === 'hash') {
                    this.isClaimed = true;
                }
            });

            rewardsRef.child(this.data.key).onDisconnect().remove();

            this.startConfetti();

            if (this.$state.extdevPrivateKey) {
                try {
                    this.pool = await this.poolService.getRewardPool(this.data.pool);
                    this.rule = await this.pool.getRewardRule(this.data.rule);
                } catch (err) {
                    this.error = `An error occured while connecting to the pool.`;
                }
            } else {
                this.createQRCode(JSON.stringify(this.data));
            }
        } else {
            console.log(this.error);
            this.error = 'Your have tried a faulty URL. Please use another one.';
        }
    }

    private createQRCode(dataString: string) {
        QRCode.toCanvas(this.$refs.canvas, dataString, (err: string) => {
            if (err) {
                console.error(err);
            }
        });
    }

    private startConfetti() {
        for (let i = 0; i < 250; i++) {
            this.confetti.push(i);
        }
    }
}
