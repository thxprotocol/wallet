import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import { RewardPollFinishedEvent } from '@/models/RewardPoolEvents';
import { RewardRule } from '@/models/RewardRule';
import PoolService from '@/services/PoolService';
import { Reward } from '@/models/Reward';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'rewardpollfinished-event',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class RewardPollFinished extends Vue {
    @Prop() public ev!: RewardPollFinishedEvent;
    @Prop() public pool!: RewardPool;

    private reward: Reward | null = null;
    private rule: RewardRule | null = null;
    private poolService: PoolService = new PoolService();

    public async created() {
        this.reward = await this.poolService.getReward(this.ev.id, this.pool);
    }
}