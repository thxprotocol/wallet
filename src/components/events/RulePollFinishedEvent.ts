import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import { RulePollFinishedEvent } from '@/models/RewardPoolEvents';
import { RewardRule } from '@/models/RewardRule';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'RulePollFinished',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class RulePollFinished extends Vue {
    @Prop() public ev!: RulePollFinishedEvent;
    @Prop() public pool!: RewardPool;

    private rule: RewardRule | null = null;

    public async created() {
        this.rule = await this.pool.getRewardRule(this.ev.rule);
    }
}
