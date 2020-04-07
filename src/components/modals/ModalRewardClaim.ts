import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import CModal from './Modal.vue';
import { BButton } from 'bootstrap-vue';
import firebase from 'firebase/app';
import 'firebase/database';

@Component({
    name: 'ModalRewardClaim',
    components: {
        'b-button': BButton,
        'c-modal': CModal,
    },
})
export default class ModalRewardClaim extends Vue {
    @Prop() private pool!: RewardPool;
    @Prop() private rule!: RewardRule;

    private loading: boolean = false;
    private data: any = null;
    private dataString: string = '';

    private async invalidate() {
        await firebase.database().ref(`/pools/rewards/${this.data.key}`).remove();
        this.$bvModal.hide('modalRewardClaim');
    }

    private async generate() {
        const QRCode = (window as any).QRCode;
        const snap = await firebase.database().ref(`/pools/rewards`).push();
        const data = (this.data = {
            pool: this.pool.address,
            rule: this.rule.id,
            key: snap.key,
        });
        const dataString = (this.dataString = JSON.stringify(data));

        await firebase.database().ref(`/pools/${this.pool.address}/rewards/${snap.key}`).set(data);

        QRCode.toCanvas(this.$refs.canvas, dataString, (err: string) => {
            if (err) {
                console.error(err);
            }
        });
    }
}
