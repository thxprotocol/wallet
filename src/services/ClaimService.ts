import { Vue } from 'vue-property-decorator';
import { RewardRule } from '@/models/RewardRule';
import firebase from 'firebase/app';
import 'firebase/database';
import { RewardPool } from '@/models/RewardPool';

export default class ClaimService extends Vue {

    public async claim(data: any, rule: RewardRule, pool: RewardPool) {
        if (rule) {
            try {
                const tx = await pool.createReward(rule.id);

                firebase.database().ref(`pools/${pool.address}/rewards/${data.key}`).update({
                    hash: tx.transactionHash,
                    pool: pool.address,
                    rule: rule.id,
                });

                return;
            } catch (err) {
                return err;
            }
        }
}
}
