import firebase from 'firebase/app';
import 'firebase/database';
import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';
import { Account } from '@/models/Account';
import { RewardPool } from '@/models/RewardPool';
const RewardPoolJSON = require('@/contracts/RewardPool.json');

export default class PoolService extends Vue {
    public events: string[] = [
        'Deposited',
        'ManagerAdded',
        'ManagerRemoved',
        'MemberAdded',
        'MemberRemoved',
        'RulePollCreated',
        'RulePollFinished',
        'RuleStateChanged',
        'Withdrawn',
    ];
    private $account!: Account;
    private $network!: Network;

    public async getRewardPoolContract(address: string) {
        return await this.$network.getExtdevContract(
            this.$network.extdev.web3js,
            RewardPoolJSON.abi,
            address,
        );
    }

    public async getRewardPool(address: string) {
        return new RewardPool(
            address,
            await this.getRewardPoolContract(address),
            this.$network.extdev.account,
        );
    }

    public getMyRewardPools() {
        if (this.$account) {
            return firebase.database().ref(`users/${this.$account.uid}/pools`)
                .once('value').then(async (s: any) => {
                    const nid = await this.$network.extdev.web3js.eth.net.getId();
                    const hash = RewardPoolJSON.networks[nid].transactionHash;
                    const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
                    const data: any = s.val();

                    const pools: any = {};

                    for (const a in data) {
                        const pool = new RewardPool(
                            a,
                            await this.getRewardPoolContract(a),
                            this.$network.extdev.account,
                        );
                        pool.setOutOfSync(a !== receipt.contractAddress);

                        pools[data[a].address] = pool;
                    }

                    return pools;
                });
        }
    }

    public joinRewardPool(address: string) {
        return firebase.database().ref(`users/${this.$account.uid}/pools`).child(address)
            .set({
                address,
            });
    }

}
