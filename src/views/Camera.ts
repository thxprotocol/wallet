import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import { BSpinner } from 'bootstrap-vue';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';

const RewardPool = require('../contracts/RewardPool.json');
const THX = window.THX;

@Component({
    name: 'Camera',
    components: {
        BSpinner,
        QrcodeStream,
        QrcodeCapture,
    },
})
export default class Camera extends Vue {
    public loading: boolean = true;
    public hasStream: boolean = false;

    public repaint() {
        return;
    }

    public toast(title: string, body: string, variant: string = 'info') {
        this.$bvToast.toast(body, {
            title,
            toaster: 'b-toaster-bottom-full',
            autoHideDelay: 3000,
            appendToast: true,
            variant,
        });
    }

    public async onInit(promise: Promise) {
        try {
            await promise;
            this.hasStream = true;
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                this.toast('Camera error:', 'user denied camera access permisson', 'danger');
            } else if (error.name === 'NotFoundError') {
                this.toast('Camera error:', 'no suitable camera device installed', 'danger');
            } else if (error.name === 'NotSupportedError') {
                this.toast('Camera error:', 'page is not served over HTTPS (or localhost)', 'danger');
            } else if (error.name === 'NotReadableError') {
                this.toast('Camera error:', 'maybe camera is already in use', 'danger');
            } else if (error.name === 'OverconstrainedError') {
                this.toast('Camera error:', 'did you requested the front camera although there is none?', 'danger');
            } else if (error.name === 'StreamApiNotSupportedError') {
                this.toast('Camera error:', 'browser seems to be lacking features', 'danger');
            }
            this.hasStream = false;
        } finally {
            this.loading = false;
        }
    }

    public async onDecode(decodedString: string) {
        // eslint-disable-next-line
        console.log(decodedString);

        if (decodedString.length > 0) {
            const poolsRef = firebase.database().ref(`pools`);
            const data = JSON.parse(decodedString);
            const pool = await THX.network.contract(RewardPool, data.pool);

            poolsRef.child(data.pool).child(`rewards`).push().set(data);

            this.toast(
                'Reward status update',
                `Claiming your reward for rule #${data.rule} in pool ${data.pool}...`,
            );

            pool.methods.createReward(data.rule).send({ from: THX.network.account.address }).then((tx: any) => {
                this.toast(
                    'Reward status update',
                    'Your claim is up for review!',
                    'success',
                );
                // eslint-disable-next-line
                console.log(tx);
            });
        }
    }

}
