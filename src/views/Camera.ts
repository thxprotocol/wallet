import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BSpinner, BAlert } from 'bootstrap-vue';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';
import PoolService from '@/services/PoolService';
import { RewardPool, IRewardPools } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import UserService from '@/services/UserService';
import { Account } from '@/models/Account';
import { VueRouter } from 'vue-router/types/router';

@Component({
    name: 'Camera',
    components: {
        'b-alert': BAlert,
        'b-spinner': BSpinner,
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
            account: 'account',
        }),
    },
})
export default class Camera extends Vue {
    public loading: boolean = true;
    public hasStream: boolean = false;
    public $router!: VueRouter;
    private account!: Account;
    private slack: string = '';
    private data!: any;
    private pool!: RewardPool;
    private rule: RewardRule | null = null;
    private error: string = '';
    private poolService: PoolService = new PoolService();
    private userService: UserService = new UserService();
    private rewardPools!: IRewardPools;

    private repaint() {
        return;
    }

    private async onDecode(decodedString: string) {
        if (decodedString.length > 0) {
            this.data = JSON.parse(decodedString);
            this.error = '';

            try {
                if (this.data.pool && (this.data.rule >= 0)) {
                    // Should check for membership of the pool instead of pool existance
                    this.pool = await this.poolService.getRewardPool(this.data.pool);
                    this.rule = await this.pool.getRewardRule(this.data.rule);
                } else if (this.data.slack) {
                    // Should check for membership of the pool instead of pool existance
                    this.pool = await this.poolService.getRewardPool(this.data.pool);
                    this.slack = this.data.slack;
                } else {
                    throw({ message: `An error occured while decoding your QR code.`});
                }
            } catch (err) {
                this.error = (err.message) ? err.message : err;
            }
        }
    }

    private connect() {
        if (this.pool && this.account) {
            this.userService.connectSlack(this.account, this.data.slack)
                .then(() => {
                    this.$router.push(`/account`);
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
