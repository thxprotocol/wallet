import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import modal from '../components/Modal.vue';
import { BCard, BCardText, BSpinner } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import { RewardPool } from '@/models/RewardPool';

const BN = require('bn.js');
const coinMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'pools',
    components: {
        modal,
        BCard,
        BCardText,
        BSpinner,
    },
})
export default class Pools extends Vue {
    private $network!: Network;
    private poolService: PoolService = new PoolService();
    private coinService: CoinService = new CoinService();

    public loading: any = false;
    public pools: any = {};
    public showJoinPoolModal: any = false;
    public input: any = {
        poolAddress: '',
    };

    constructor() {
        super();


        // firebase.database().ref(`users/${this.$account.uid}/pools`)
        //     .on('child_added', async (s) => {
        //         const hash = RewardPoolJSON.networks[9545242630824].transactionHash;
        //         const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
        //
        //         console.log(receipt)
        //
        //         const data = s.val();
        //         console.log(data);
        //         debugger
        //
        //         this.contracts[data.address] = contract;
        //
        //         data.name = await this.contracts[data.address].methods.name().call();
        //         console.log(data);
        //         debugger
        //
        //         if (data.name && receipt) {
        //
        //             const extdevPoolBalance: number = await this.$network.getExtdevCoinBalance(
        //                 this.$network.extdev.account,
        //                 data.address,
        //             );
        //             data.outOfSync = (data.address !== receipt.contractAddress);
        //             data.balance = new BN(extdevPoolBalance).mul(coinMultiplier);
        //         }
        //
        //         this.loading = false;
        //
        //         Vue.set(this.pools, data.address, data);
        //     });
        //
        // firebase.database().ref(`users/${this.$account.uid}/pools`)
        //     .on('child_removed', (s: any) => {
        //         Vue.delete(this.pools, s.key);
        //     });
    }

    mounted() {
        this.loading = true;

        this.poolService.getRewardPools()
            .then(async (pools: any) => {
                this.pools = pools;
                this.loading = false;

                for (let a in pools) {
                    const pool: RewardPool = pools[a];

                    if (pool) {
                        const balance = await this.coinService.getBalance(pool.address);

                        pool.setBalance(balance);
                    }
                }
            })
            .catch((err: string) => {
                console.error(err);
            });

    }

    public onJoinPool() {
        firebase.database().ref(`users/${this.$account.uid}/pools`).child(this.input.poolAddress).set({
            address: this.input.poolAddress,
        });

        return this.showJoinPoolModal = false;
    }

    public onLeavePool(poolAddress: string) {
        return firebase.database().ref(`users/${this.$account.uid}/pools`).child(poolAddress).remove();
    }

    public openPool(poolAddress: string) {
        return this.$router.replace(`/pools/${poolAddress}`);
    }
}
