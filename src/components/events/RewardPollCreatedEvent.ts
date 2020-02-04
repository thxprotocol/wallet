import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPollCreatedEvent, RewardPool } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import PoolService from '@/services/PoolService';
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
    private poolService: PoolService = new PoolService();

    public async created() {
        this.reward = await this.poolService.getReward(this.ev.id, this.pool);
        this.rule = await this.poolService.getRewardRule(this.reward.rule, this.pool);
    }
}
