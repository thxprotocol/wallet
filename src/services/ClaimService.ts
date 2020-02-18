import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';
import { Account } from '@/models/Account';
import store from '../store';
import EventService from './EventService';
import { RewardRule } from '@/models/RewardRule';
import firebase from 'firebase/app';
import 'firebase/database';
import { RewardPool } from '@/models/RewardPool';

export default class CoinService extends Vue {
    public $store: any = store;
    private $account!: Account;
    private $events!: EventService;
    private $network!: Network;

    public async claim(data: any, rule: RewardRule, pool: RewardPool) {
        if (rule) {
            try {
                const snap = await firebase.database().ref(`pools/${pool.address}/rewards/${data.key}`).once('value');

                if (!snap.val()) {
                    throw({
                        message: `Your QR Code is invalid. Try a new one.`,
                    });
                }

                if (!snap.val().hash) {
                    const tx = await pool.createReward(rule.id);

                    firebase.database().ref(`pools/${pool.address}/rewards/${data.key}`).update({
                        hash: tx.transactionHash,
                    });

                    return;
                } else {
                    throw({
                        message: `You have already claimed your reward.`,
                    });
                }

            } catch (err) {
                return err;
            }
        }
}
}
