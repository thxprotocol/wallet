import { Component, Prop, Vue } from 'vue-property-decorator';
import PoolService from '@/services/PoolService';
import { RewardPool } from '@/models/RewardPool';
import firebase from 'firebase/app';

const QRCode = (window as any).QRCode;

@Component({
    name: 'Claim',
})
export default class Claim extends Vue {
    public error: string = '';
    public poolService: PoolService = new PoolService();
    public pool!: RewardPool;
    public confetti: any = [];
    private isClaimed: boolean = false;

    private async mounted() {
        if (this.$route.params.rule && this.$route.params.pool) {
            const rewardsRef = firebase.database().ref(`pools/${this.$route.params.pool}/rewards`);
            const snap = await rewardsRef.push();
            const data: any = {
                 rule: parseInt(this.$route.params.rule, 10),
                 pool: this.$route.params.pool,
                 key: snap.key,
            };
            const stringified = JSON.stringify(data);

            rewardsRef.child(data.key)
                .set(data);

            rewardsRef.child(data.key)
                .on('child_added', (s: any) => {
                    if (s.key === 'hash') {
                        this.isClaimed = true;
                    }
                });

            rewardsRef.child(data.key)
                .onDisconnect().remove();

            this.createQRCode(stringified);
            this.startConfetti();
        } else {
            console.log(this.error);
            this.error = 'Your have tried a faulty URL. Please use another one.';
        }
    }
    private createQRCode(data: any) {
        QRCode.toCanvas(
            this.$refs.canvas,
            data,
            (err: string) => {
                if (err) {
                    console.error(err);
                }
            },
        );
    }

    private startConfetti() {
        for (let i = 0; i < 250; i++) {
            this.confetti.push(i);
        }
    }

}
