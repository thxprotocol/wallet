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

    private rule: RewardRule | null = null;
    private reward: Reward | null = null;

    private created() {
        this.reward = this.pool.rewards[this.ev.id];

        if (this.reward) {
            this.rule = this.pool.rewardRules[this.reward.rule];
        }
    }
}
