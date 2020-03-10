import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import { RulePollCreatedEvent } from '@/models/RewardPoolEvents';
import { RewardRule } from '@/models/RewardRule';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'RulePollCreated',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class RulePollCreated extends Vue {
    @Prop() public ev!: RulePollCreatedEvent;
    @Prop() public pool!: RewardPool;

    private rule: RewardRule | null = null;

    public async created() {
        this.rule = await this.pool.getRewardRule(this.ev.rule);
    }
}
