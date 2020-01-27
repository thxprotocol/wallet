import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RulePollFinishedEvent, RewardPool } from '@/models/RewardPool';
import { RewardRule } from '@/models/RewardRule';
import PoolService from '@/services/PoolService';

@Component({
    name: 'RulePollFinished',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class RulePollFinished extends Vue {

    @Prop() public ev!: RulePollFinishedEvent;
    @Prop() public pool!: RewardPool;
    private rule: RewardRule | null = null;
    private poolService: PoolService = new PoolService();

    public async created() {
        this.rule = await this.poolService.getRewardRule(this.ev.rule, this.pool);
    }
}
