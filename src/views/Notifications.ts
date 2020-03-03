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
import { Reward, IRewards } from '@/models/Reward';
import _ from 'lodash';
import EventService from '@/services/EventService';
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
})
export default class Notifications extends Vue {
    public error: string = '';
    public loading: any = false;
    public rules: IRewardRules = {};
    public rewards: IRewards = {};
    private $account!: Account;
    private $network!: Network;
    private poolService: PoolService = new PoolService();
    private isManager: boolean = false;
    private isMember: boolean = false;
    private eventService: EventService = new EventService();

    get events() {
        return {...this.rules, ...this.rewards};
    }

    public async created() {
        const snap = await firebase.database().ref(`users/${this.$account.uid}/pools`).once('value');

        for (const address in snap.val()) {
            if (snap.val()[address]) {
                this.poolService.getRewardPool(address)
                    .then(async (pool: RewardPool) => {
                        this.isMember = await pool.isMember(this.$network.extdev.account);
                        this.isManager = await pool.isManager(this.$network.extdev.account);

                        this.getRewards(pool);
                        this.getRewardRules(pool);

                        this.eventService.destroy();

                        for (const eventType of ['RewardPollCreated', 'RulePollCreated']) {
                            this.eventService.listen(`event.${eventType}`, (event: any) => {
                                (this as any)[`on${eventType}`](event.detail, pool);
                            });
                        }
                    })
                    .catch((err: string) => {
                        this.error = err;
                    });
            }
        }
    }

    private beforeDestroy() {
        this.eventService.destroy();
    }

    private async onRewardPollCreated(data: any, pool: RewardPool) {
        const reward = await this.poolService.getReward(data.reward, pool);

        await reward.update();

        Vue.set(this.rewards, reward.address, {reward, pool});
    }

    private async onRulePollCreated(data: any, pool: RewardPool) {
        const rule = await this.poolService.getRewardRule(data.id, pool);

        Vue.set(this.rules, rule.pollAddress, {rule, pool});
    }

    private async getRewardRules(pool: RewardPool) {
        const rules = await this.poolService.getRewardRules(pool);

        for (const rule of rules) {
            if (rule.hasPollAddress) {
                Vue.set(this.rules, rule.pollAddress, {rule, pool});
            }
        }
    }

    private async getRewards(pool: RewardPool) {
        const rewardsLength = await pool.countRewards();

        for (let i = parseInt(rewardsLength, 10) - 1; i >= 0; i--) {
            const reward: Reward = await this.poolService.getReward(i, pool);
            const state = await reward.getState();

            if (state === 'Pending') {
                await reward.update();

                Vue.set(this.rewards, reward.address, {reward, pool});
            }
        }
    }
}
