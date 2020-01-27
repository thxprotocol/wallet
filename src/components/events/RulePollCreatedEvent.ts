import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RulePollCreatedEvent, RewardPool } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import PoolService from '@/services/PoolService';

@Component({
    name: 'RulePollCreated',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class RulePollCreated extends Vue {

    @Prop() public ev!: RulePollCreatedEvent;
    @Prop() public pool!: RewardPool;
    private rule: RewardRule | null = null;
    private poolService: PoolService = new PoolService();

    public async created() {
        this.rule = await this.poolService.getRewardRule(this.ev.rule, this.pool);
    }
}
