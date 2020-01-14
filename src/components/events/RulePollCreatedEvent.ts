import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RuleStateChangedEvent, RewardPool } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import PoolService from '@/services/PoolService';

@Component({
    name: 'RulePollCreated',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class RuleStRulePollCreatedateChanged extends Vue {

    @Prop() public ev!: RuleStateChangedEvent;
    @Prop() public pool!: RewardPool;
    private rule: RewardRule | null = null;
    private poolService: PoolService = new PoolService();

    public async created() {
        console.log(this.ev);
        console.log(this.pool);

        this.rule = await this.poolService.getRewardRule(this.ev.rule, this.pool);
    }
}
