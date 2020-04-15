import { Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import REWARD_POOL_ABI from '@/contracts/RewardPool.abi';
import REWARD_POOL_BIN from '@/contracts/RewardPool.bin';
import firebase from 'firebase/app';
import 'firebase/database';

export default class PoolService extends Vue {
    public async getRewardPool(address: string) {
        const contract = await this.$network.getExtdevContract(REWARD_POOL_ABI, address);
        const pool = new RewardPool(address, contract, this.$network);

        return pool;
    }

    public async requestMembership(address: string, message: string, pool: RewardPool): Promise<string | void> {
        const snap = await firebase.database().ref(`/pools/${pool.address}/notificatons`).push();

        return firebase
            .database()
            .ref(`/pools/${pool.address}/notifications/${snap.key}`)
            .set({
                address,
                component: 'notification-membership-request',
                public: false,
                message: message ? message : null,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
            });
    }

    public join(uid: string, address: string) {
        const utils: any = this.$network.web3js.utils;

        if (utils.isAddress(address)) {
            return firebase.database().ref(`users/${uid}/pools`).child(address).set({ address });
        } else {
            return Promise.reject(`${address} is not a valid address.`);
        }
    }

    public leave(uid: string, address: string) {
        const utils: any = this.$network.web3js.utils;

        if (utils.isAddress(address)) {
            return firebase.database().ref(`users/${uid}/pools`).child(address).remove();
        } else {
            return Promise.reject(`${address} is not a valid address.`);
        }
    }

    public async create(name: string): Promise<string | void> {
        if (!name) {
            return Promise.reject(`No name provided for the pool to be created.`);
        }

        const poolName = name.substring(0, 30);
        const extdev = this.$network.extdev;
        const rewardPoolContract = new extdev.web3js.eth.Contract(REWARD_POOL_ABI);

        const myExtDevCoinAddress = await this.$network.getExtdevCoinContractAddress();

        return rewardPoolContract
            .deploy({
                data: REWARD_POOL_BIN,
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
