import firebase from 'firebase/app';
import 'firebase/database';
import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';
import { Account } from '@/models/Account';
import { RewardPool } from '@/models/RewardPool';
const RewardPoolJSON = require('@/contracts/RewardPool.json');

export default class PoolService extends Vue {
    private $account!: Account;
    private $network!: Network;
    public events: string[];

    constructor() {
        super();

        this.events = [
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
    }

    async getRewardPoolContract() {
        return await this.$network.getExtdevContract(
            this.$network.extdev.web3js,
            RewardPoolJSON,
        );
    }

    public getRewardPools() {
        if (this.$account) {
            return firebase.database().ref(`users/${this.$account.uid}/pools`)
                .once('value').then(async (s: any) => {
                    const data: any = s.val();
                    let pools: any = {};

                    for (const a in data) {
                        pools[data[a].address] = new RewardPool(
                            data[a].address,
                            await this.getRewardPoolContract(),
                            this.$network.extdev.account,
                        );
                    }

                    return pools;
                });
        }
    }

}
