import { Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import REWARD_POOL_JSON from '@/contracts/RewardPool.json';
import firebase from 'firebase/app';
import 'firebase/database';

export default class PoolService extends Vue {

    public async getRewardPoolAddress() {
        const nid = await this.$network.extdev.web3js.eth.net.getId();
        const hash = REWARD_POOL_JSON.networks[nid].transactionHash;
        const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);

        return receipt.contractAddress;
    }

    public async getRewardPool(address: string) {
        const nid = await this.$network.extdev.web3js.eth.net.getId();
        const hash = REWARD_POOL_JSON.networks[nid].transactionHash;
        const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
        const contract = await this.$network.getExtdevContract(REWARD_POOL_JSON.abi, address);
        const pool = new RewardPool(address, contract, this.$network);

        pool.setOutOfSync(address !== receipt.contractAddress);

        return pool;
    }

    public join(uid: string, address: string) {
        const utils: any = this.$network.web3js.utils;

        if (utils.isAddress(address)) {
            return firebase.database().ref(`users/${uid}/pools`).child(address).set({ address });
        } else {
            return Promise.resolve();
        }
    }

    public leave(uid: string, address: string) {
        const utils: any = this.$network.web3js.utils;

        if (utils.isAddress(address)) {
            return firebase.database().ref(`users/${uid}/pools`).child(address).remove();
        } else {
            return Promise.resolve();
        }
    }

    public async create(name: string): Promise<string | void> {
        if (!name) {
            return Promise.resolve();
        }

        const poolName = name.substring(0, 30);
        const extdev = this.$network.extdev;
        const rewardPoolContract = new extdev.web3js.eth.Contract(REWARD_POOL_JSON.abi);

        const myExtDevCoinAddress = await this.$network.getExtdevCoinContractAddress();

        return rewardPoolContract
            .deploy({
                data: REWARD_POOL_JSON.bytecode,
                arguments: [poolName, myExtDevCoinAddress],
            })
            .send({ from: extdev.account })
            .then((newContractInstance: any) => newContractInstance.options.address)
            .catch((e: any) => console.error(e));
    }

    public async createAndJoin(uid: string, name: string) {
        const poolAddress = await this.create(name);
        if (poolAddress) {
            return this.join(uid, poolAddress);
        }
    }
}
