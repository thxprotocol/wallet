import firebase from 'firebase/app';
import 'firebase/database';
import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';
import { Account } from '@/models/Account';
import { RewardPool, IRewardPools } from '@/models/RewardPool';
const RewardPoolJSON = require('@/contracts/RewardPool.json');
import store from '../store';
import CoinService from './CoinService';

export default class PoolService extends Vue {
    public $store: any = store;
    private $account!: Account;
    private $network!: Network;
    private coinService: CoinService = new CoinService();

    public init() {
        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_added', async (s: any) => {
                this.getRewardPool(s.key)
                    .then((pool: RewardPool) => {
                        this.$store.commit('addRewardPool', pool);
                    });
            });

        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_removed', (s: any) => {
                this.getRewardPool(s.key)
                    .then((pool: RewardPool) => {
                        this.$store.commit('removeRewardPool', pool);
                    });
            });
    }

    public async getRewardPoolContract(address: string) {
        return await this.$network.getExtdevContract(
            this.$network.extdev.web3js,
            RewardPoolJSON.abi,
            address,
        );
    }

    public async getRewardPool(address: string) {
        const nid = await this.$network.extdev.web3js.eth.net.getId();
        const hash = RewardPoolJSON.networks[nid].transactionHash;
        const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
        const pool = new RewardPool(
            address,
            await this.getRewardPoolContract(address),
            this.$network.extdev.account,
        );

        pool.setOutOfSync(address !== receipt.contractAddress);

        return pool;
    }

    public getMyRewardPools() {
        return firebase.database().ref(`users/${this.$account.uid}/pools`)
            .once('value')
            .then(async (s: any) => {
                const data: any = s.val();
                let pools: any = {};

                for (const address in data) {
                    const pool = await this.getRewardPool(address);
                    const balance = await this.coinService.getExtdevBalance(pool.address);

                    pool.setBalance(balance);

                    pools[address] = pool;
                }
                console.log(pools);
                return pools;
            });
    }

    public joinRewardPool(address: string) {
        return firebase.database().ref(`users/${this.$account.uid}/pools`).child(address)
            .set({
                address,
            });
    }

}
