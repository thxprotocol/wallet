import { Component, Prop, Vue } from 'vue-property-decorator';
import ProfilePicture from '../components/ProfilePicture';
import { BProgress, BListGroupItem } from 'bootstrap-vue';

const THX = window.THX;

@Component({
    name: 'Reward',
    components: {
        BProgress,
        BListGroupItem,
        ProfilePicture,
    },
})
export default class Reward extends Vue {
    public loading: boolean = false;

    @Prop() reward: any = null;
    @Prop() contract: any = null;
    @Prop() account: any = {
            loom: {
                address: ''
            }
        };

    public mounted() {

    }

    async withdraw() {
        this.loading = true;

        return await this.reward.contract.methods.withdraw()
            .send({ from: THX.network.account.address })
            .then(async (tx: any) => {
                this.loading = false;
                // eslint-disable-next-line
                console.log(tx);
            })
            .catch((err: string) => {
                this.loading = false;
                // eslint-disable-next-line
                console.error(err);
            })
    }
    async finalizePoll() {
        this.loading = true;

        return await this.reward.contract.methods.tryToFinalize()
            .send({ from: THX.network.account.address })
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
            })
    }
}