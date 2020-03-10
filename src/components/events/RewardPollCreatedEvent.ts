import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import { RewardPollCreatedEvent } from '@/models/RewardPoolEvents';
import { RewardRule } from '@/models/RewardRule';
import { Reward } from '@/models/Reward';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'rewardpollcreated-event',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class RewardPollCreated extends Vue {
    @Prop() public ev!: RewardPollCreatedEvent;
    @Prop() public pool!: RewardPool;

    private reward: Reward | null = null;
    private rule: RewardRule | null = null;

    public async created() {
        this.reward = await this.pool.getReward(this.ev.id);
        this.rule = await this.pool.getRewardRule(this.reward.rule);
    }
}
