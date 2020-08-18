import { Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import REWARD_POOL_ABI from '@/contracts/RewardPool.abi';
import REWARD_POOL_BIN from '@/contracts/RewardPool.bin';
import firebase from 'firebase/app';
import 'firebase/database';
import { Contract } from 'loom-js';
import { ConsolidateDelegationsRequest } from 'loom-js/dist/proto/dposv3_pb';

export default class PoolService extends Vue {
    public async getRewardPool(address: string) {
        const contract = await this.$network.getExtdevContract(REWARD_POOL_ABI, address);
        const pool = new RewardPool(address, contract, this.$network);

        return pool;
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

    public async create(name: string): Promise<any | void> {
        const extdev = this.$network.extdev;
        const rewardPoolContract = new extdev.web3js.eth.Contract(REWARD_POOL_ABI);
        const myExtDevCoinAddress = await this.$network.getExtdevCoinContractAddress();

        return rewardPoolContract
            .deploy({
                data: REWARD_POOL_BIN,
            })
            .send({ from: extdev.account })
            .then(async (instance: any) => {
                await instance.methods.initialize(extdev.account, myExtDevCoinAddress).send({ from: extdev.account });

                await instance.methods.addMember(extdev.account).send({ from: extdev.account });
                await instance.methods.addManager(extdev.account).send({ from: extdev.account });

                return instance.options.address;
            });
    }

    public async createAndJoin(uid: string, name: string) {
        if (!name) {
            return Promise.reject(`No name provided for the pool to be created.`);
        }
        const poolName = name.substring(0, 30);
        const poolAddress = await this.create(poolName);

        await firebase.database().ref(`pools/${poolAddress}/name`).set(poolName);

        if (poolAddress) {
            return this.join(uid, poolAddress);
        }
    }
}
