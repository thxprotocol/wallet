import { RewardRule } from '@/models/RewardRule';
import firebase from 'firebase/app';
import 'firebase/database';
import { RewardPool } from '@/models/RewardPool';

export default class ClaimService {
    public async claim(data: any, rule: RewardRule, pool: RewardPool) {
        if (rule) {
            try {
                const tx = await pool.createReward(rule.id);

                return firebase.database().ref(`pools/${pool.address}/rewards/${data.key}`).update({
                    hash: tx.transactionHash,
                    pool: pool.address,
                    rule: rule.id,
                });
            } catch (err) {
                return err;
            }
        }
}
}
