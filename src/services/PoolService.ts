import { Vue } from 'vue-property-decorator';
import NetworkService from '@/services/NetworkService';
import { RewardPool } from '@/models/RewardPool';
import REWARD_POOL_JSON from '@/contracts/RewardPool.json';
import firebase from 'firebase/app';
import 'firebase/database';

export default class PoolService extends Vue {
    private $network!: NetworkService;

    public async getRewardPool(address: string) {
        const nid = await this.$network.extdev.web3js.eth.net.getId();
        const hash = REWARD_POOL_JSON.networks[nid].transactionHash;
        const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
        const contract = await this.$network.getExtdevContract(REWARD_POOL_JSON.abi, address);
        const pool = new RewardPool(
            address,
            contract,
            this.$network,
        );

        pool.setOutOfSync(address !== receipt.contractAddress);

        return pool;
    }

    public join(uid: string, address: string) {
        const utils: any = this.$network.web3js.utils;

        if (utils.isAddress(address)) {
            return firebase.database().ref(`users/${uid}/pools`).child(address)
                .set({ address });
        } else {
            return Promise.resolve();
        }
    }

    public leave(uid: string, address: string) {
        const utils: any = this.$network.web3js.utils;

        if (utils.isAddress(address)) {
            return firebase.database().ref(`users/${uid}/pools`).child(address)
                .remove();
        } else {
            return Promise.resolve();
        }
    }
}
