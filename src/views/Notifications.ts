import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import CReward from '../components/Reward.vue';
import CRule from '../components/Rule.vue';
import { BSpinner, BCard, BCardText, BProgress, BProgressBar } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import { RewardPool, IRewardPools } from '@/models/RewardPool';
import { Reward, IRewards } from '@/models/Reward';
import _ from 'lodash';
import { RewardRule, IRewardRules } from '@/models/RewardRule';

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
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
        }),
    },
})
export default class Notifications extends Vue {
    public error: string = '';
    public loading: any = false;
    public rules: IRewardRules = {};
    public rewards: IRewards = {};
    private $account!: Account;
    private rewardPools!: IRewardPools;

    get events() {
        const rules = [];
        const rewards = [];

        for (const address in this.rewardPools) {
            if (this.rewardPools[address]) {
                const pool = this.rewardPools[address];

                for (const i in pool.rewards) {
                    if (pool.rewards[i]) {
                        rewards.push({reward: pool.rewards[i], pool});
                    }
                }

                for (const i in pool.rewardRules) {
                    if (pool.rewardRules[i]) {
                        rules.push({rule: pool.rewardRules[i], pool});
                    }
                }
            }
        }

        return {...rules, ...rewards};
    }
}
