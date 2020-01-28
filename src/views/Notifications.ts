import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import ProfilePicture from '../components/ProfilePicture';
import { BSpinner, BCard, BCardText, BProgress, BProgressBar } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import { Network } from '@/models/Network';
import REWARD_JSON from '../contracts/Reward.json';

const REWARD_STATE = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];

@Component({
    name: 'home',
    components: {
        BSpinner,
        ProfilePicture,
        BCard,
        BCardText,
        BProgress,
        BProgressBar,
    },
})
export default class Notifications extends Vue {
    public events: any = null;
    public network: any = null;
    public notifications: any[] = [];
    public currentNotification: any = 0;
    public loading: any = false;
    private $network!: Network;
    private $account!: Account;

    public async created() {
        firebase.database().ref(`users/${this.$account.uid}/pools`).once('value').then(async (s) => {
            const pools = s.val();


            // Get all the pools
            // for (const poolAddress in pools) {
            //     const pool = await this.$network.extdev.account.contract(RewardPool, poolAddress);
            //     const amountOfRewards = await pool.methods.countRewards().call();
            //     const isManager = await pool.methods.isManager(THX.network.account.address).call();
            //
            //     if (isManager) {
            //         for (let i = 0; i < amountOfRewards; i++) {
            //             const rewardAddress = await pool.methods.rewards(i).call();
            //             const contract = await THX.network.contract(Reward, rewardAddress);
            //             const state = await contract.methods.state().call();
            //
            //             // TEMP Check if state is pending (0)
            //             if (state == 3) {
            //                 const reward = await this.formatReward(contract, pool);
            //
            //                 Vue.set(this.notifications, reward.id, reward);
            //             }
            //         }
            //     }
            // }
        });
    }

    public async formatReward(contract: any, pool: any) {
        // const token = await this.$network.getExtdevCoinContract(
        //     this.$network.web3js,
        // );
        // const utils = this.$network.web3js.utils;
        // const address = this.$network.extdev.account.address;
        //
        // const id = parseInt(await contract.methods.id().call());
        // const slug = await contract.methods.slug().call();
        // const dateTime = parseInt(await contract.methods.created().call());
        // const amount = utils.fromWei(await contract.methods.amount().call(), 'ether');
        // const state = RewardState[await contract.methods.state().call()];
        // const beneficiary = (await contract.methods.beneficiary().call()).toLowerCase();
        //
        // const wallet = await firebase.database().ref('wallets').child(beneficiary).once('value');
        // const user = await firebase.database().ref(`users/${wallet.val().uid}`).once('value');
        //
        // const rule = await firebase.database().ref(`pools/${pool._address}/rules/${slug}`).once('value');
        // const totalVoted = await contract.methods.totalVoted().call();
        // const yesCounter = await contract.methods.yesCounter().call();
        // const noCounter = await contract.methods.noCounter().call();
        // const startTime = await contract.methods.startTime().call();
        // const endTime = await contract.methods.endTime().call();
        // const now = (await this.$network.web3js.eth.getBlock('latest')).timestamp;
        // const diff = (endTime - now);
        //
        // const vote = await contract.methods.votesByAddress(address).call();
        // const poolName = await pool.methods.name().call();
        // const balance = await token.methods.balanceOf(pool._address).call();
        //
        // return {
        //     id,
        //     pool: {
        //         address: pool._address,
        //         name: poolName,
        //         balance: utils.fromWei(balance, 'ether'),
        //     },
        //     user: user.val(),
        //     rule: rule.val(),
        //     slug,
        //     amount,
        //     state,
        //     created: dateTime,
        //     poll: {
        //         now: parseInt(now),
        //         diff,
        //         totalVoted,
        //         startTime: parseInt(startTime),
        //         endTime: parseInt(endTime),
        //         hasVoted: (parseInt(vote.time) > 0),
        //         yesCounter: parseInt(utils.fromWei(yesCounter, 'ether')),
        //         noCounter: parseInt(utils.fromWei(noCounter, 'ether')),
        //     },
        // };
    }

    public async finalizePoll(id: number, poolAddress: string) {
        // const pool = await THX.network.contract(RewardPool, poolAddress);
        // const rewardAddress = await pool.methods.rewards(id).call();
        // const reward = await THX.network.contract(Reward, rewardAddress);
        //
        // this.loading = true;
        //
        // return await reward.methods.tryToFinalize()
        //     .send({ from: THX.network.account.address })
        //     .then(async (tx: any) => {
        //         this.loading = false;
        //         // eslint-disable-next-line
        //         console.log(tx);
        //     })
        //     .catch((err: string) => {
        //         this.loading = false;
        //         // eslint-disable-next-line
        //         console.error(err);
        //     });
    }

    public async vote(id: number, agree: boolean, poolAddress: string) {
        // const pool = await THX.network.contract(RewardPool, poolAddress);
        // const isManager = await pool.methods.isManager(THX.network.account.address).call();
        //
        // this.loading = true;
        //
        // if (isManager) {
        //     return pool.methods.voteForReward(id, agree).send({ from: THX.network.account.address })
        //         .then(() => {
        //             this.notifications[id].hasVoted = true;
        //             this.loading = false;
        //         })
        //         .catch((e: string) => {
        //             this.loading = false;
        //             // eslint-disable-next-line
        //             return console.error(e);
        //         });
        // } else {
        //     this.loading = false;
        // }

    }

    public async revokeVote(id: number, poolAddress: string) {
        // const pool = await THX.network.contract(RewardPool, poolAddress);
        // const isManager = await pool.methods.isManager(THX.network.account.address).call();
        //
        // if (isManager) {
        //     return pool.methods.revokeVoteForReward(id).send({ from: THX.network.account.address })
        //         .then(() => {
        //             this.notifications[id].hasVoted = false;
        //             this.loading = false;
        //         })
        //         .catch((e: string) => {
        //             this.loading = false;
        //             // eslint-disable-next-line
        //             return console.error(e);
        //         });
        // } else {
        //     this.loading = false;
        // }

    }
}
