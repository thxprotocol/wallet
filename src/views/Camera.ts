import { Component, Prop, Vue } from 'vue-property-decorator';
import { BSpinner, BAlert } from 'bootstrap-vue';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';
import PoolService from '@/services/PoolService';
import { RewardPool } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import ClaimService from '../services/ClaimService';

@Component({
    name: 'Camera',
    components: {
        'b-alert': BAlert,
        'b-spinner': BSpinner,
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
    },
})
export default class Camera extends Vue {
    public loading: boolean = true;
    public hasStream: boolean = false;
    private data!: any;
    private pool!: RewardPool;
    private rule: RewardRule | null = null;
    private success: string = '';
    private error: string = '';
    private poolService: PoolService = new PoolService();
    private claimService: ClaimService = new ClaimService();

    private repaint() {
        return;
    }

    private async onDecode(decodedString: string) {
        if (decodedString.length > 0) {
            this.data = JSON.parse(decodedString);
            this.error = '';
            this.success = `A connection to the Reward Pool is being established...`;

            try {
                this.pool = await this.poolService.getRewardPool(this.data.pool);
                this.rule = await this.poolService.getRewardRule(this.data.rule, this.pool);
            } catch (err) {
                this.error = `An error occured while connecting to the pool.`;
            }
        }
    }

    private claim() {
        if (this.rule && this.pool) {
            this.claimService.claim(this.data, this.rule, this.pool)
                .then(() => {
                    if (this.rule && this.pool) {
                        this.success = `Claimed ${this.rule.amount} THX from ${this.pool.name} for <i>${this.rule.title}.</i>`;
                    }
                })
                .catch((err: any) => {
                    if (err) {
                        this.error = err.message;
                    }
                });
        }
    }

    private async init(promise: any) {
        try {
            await promise;
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                this.error = 'Camera error: user denied camera access permisson';
            } else if (error.name === 'NotFoundError') {
                this.error = 'Camera error: no suitable camera device installed';
            } else if (error.name === 'NotSupportedError') {
                this.error = 'Camera error: page is not served over HTTPS (or localhost)';
            } else if (error.name === 'NotReadableError') {
                this.error = 'Camera error: maybe camera is already in use';
            } else if (error.name === 'OverconstrainedError') {
                this.error = 'Camera error: did you requested the front camera although there is none?';
            } else if (error.name === 'StreamApiNotSupportedError') {
                this.error = 'Camera error: browser seems to be lacking features';
            }
            this.loading = false;
        } finally {
            this.loading = false;
        }
    }

}
