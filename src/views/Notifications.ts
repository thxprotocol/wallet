import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import CReward from '../components/Reward.vue';
import CRule from '../components/Rule.vue';
import { BSpinner, BCard, BCardText, BProgress, BProgressBar } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import { Network } from '@/models/Network';
import PoolService from '@/services/PoolService';
import { RewardPool } from '@/models/RewardPool';
import { Reward } from '@/models/Reward';
import _ from 'lodash';
import { RewardRule } from '@/models/RewardRule';

@Component({
    name: 'notifications',
    components: {
        'b-spinnner': BSpinner,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
        'reward': CReward,
        'rule': CRule,
    },
})
export default class Notifications extends Vue {
    public error: string = '';
    public loading: any = false;
    public polls: any = [];
    private $account!: Account;
    private $network!: Network;
    private poolService: PoolService = new PoolService();
    private isManager: boolean = false;
    private isMember: boolean = false;

    get events() {
        return _.sortBy(this.polls, 'startTime', 'desc');
    }

    public async created() {
        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_added', async (s: any) => {
                const p = s.val();

                if (p) {
                    this.poolService.getRewardPool(p.address)
                        .then(async (pool: RewardPool) => {
                            this.isMember = await pool.isMember(this.$network.extdev.account);
                            this.isManager = await pool.isManager(this.$network.extdev.account);

                            this.getRewards(pool);
                            this.getRewardRules(pool);
                        })
                        .catch((err: string) => {
                            this.error = err;
                        });
                }
            });
    }

    private async getRewardRules(pool: RewardPool) {
        const rules = await this.poolService.getRewardRules(pool);

        for (const rule of rules) {
            if (rule.hasPollAddress) {
                this.polls.push({
                    rule,
                    pool,
                });
            }
        }

        this.polls.concat(rules);
    }

    private async getRewards(pool: RewardPool) {
        const rewardsLength = await pool.countRewards();

        for (let i = parseInt(rewardsLength, 10) - 1; i >= 0; i--) {
            const reward: Reward = await this.poolService.getReward(i, pool);
            const state = await reward.getState();

            if (state === 'Pending') {
                await reward.update();

                this.polls.push({
                    reward,
                    pool,
                });
            }
        }
    }
}
