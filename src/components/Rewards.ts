import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import Reward from './Reward';
import { BListGroup, BSpinner } from 'bootstrap-vue';
import { Network } from '@/models/Network';

const RewardJSON = require('../contracts/Reward.json');
const RewardState = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];

@Component({
    name: 'Rewards',
    components: {
        Reward,
        BListGroup,
        BSpinner,
    },
})
export default class Rewards extends Vue {
    public loading: any = false;
    public rewards: any = [];
    public amountOfRewards: any = -1;

    @Prop() public contract: any = null;
    @Prop() public account: any = {
        loom: {
            address: '',
        },
        isManager: false,
        isMember: false,
    };
    private $network!: Network;

    public mounted() {
        this.loading = true;

        this.getRewards().then(() => {
            this.loading = false;
        });

        // this.events.listen('event.RewardStateChanged', this.onRewardStateChanged);
        // this.events.listen('event.RewardPollCreated', this.onRewardPollCreated);
        // this.events.listen('event.RewardPollFinished', this.onRewardPollFinished);
    }

    public onRewardStateChanged(data: any) {
        // eslint-disable-next-line
        console.log(data);
    }

    public onRewardPollCreated(data: any) {
        // eslint-disable-next-line
        console.log(data);
    }

    public onRewardPollFinished(data: any) {
        // eslint-disable-next-line
        console.log(data);
    }

    public async subscribeRewardEvents() {
        const amount = await this.contract.methods.countRewards().call();

        for (let i = 0; i < parseInt(amount); i++) {
            const rewardAddress = await this.contract.methods.rewards(i).call();
            const reward = await this.$network.getExtdevContract(
                this.$network.web3js,
                RewardJSON,
                rewardAddress,
            );
            const state = await reward.methods.state().call();

            if (state !== 2) {
                // this.events.subscribeRewardEvents(reward.events);
            }
        }
    }

    public async getRewards() {
        const utils = this.$network.web3js.utils;

        this.amountOfRewards = parseInt( await this.contract.methods.countRewards().call() );

        for (let i = 0; i < this.amountOfRewards; i++) {
            const rewardAddress = await this.contract.methods.rewards(i).call();
            const reward = await this.$network.getExtdevContract(
                this.$network.web3js,
                RewardJSON,
                rewardAddress,
            );
            const id = await reward.methods.id().call();
            const beneficiary = (await reward.methods.beneficiary().call()).toLowerCase();
            const uid = (await firebase.database().ref(`wallets/${beneficiary}`).once('value')).val().uid;
            const user = (await firebase.database().ref(`users/${uid}`).once('value')).val();
            const now = (await this.$network.web3js.eth.getBlock('latest')).timestamp;
            const amount = utils.fromWei((await reward.methods.amount().call()), 'ether');

            Vue.set(this.rewards, id, {
                contract: reward,
                id,
                uid,
                user,
                slug: await reward.methods.slug().call(),
                now,
                startTime: parseInt(await reward.methods.startTime().call()),
                endTime: parseInt(await reward.methods.endTime().call()),
                beneficiary,
                amount,
                state: RewardState[await reward.methods.state().call()],
                created: parseInt(await reward.methods.created().call()),
            });
        }
    }
}