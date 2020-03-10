import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import { RuleStateChangedEvent } from '@/models/RewardPoolEvents';
import { RewardRule } from '@/models/RewardRule';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'RuleStateChanged',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class RuleStateChanged extends Vue {
    @Prop() public ev!: RuleStateChangedEvent;
    @Prop() public pool!: RewardPool;

    private rule: RewardRule | null = null;

    public async created() {
        this.rule = await this.pool.getRewardRule(this.ev.rule);
    }
}
