import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { MemberAddedEvent, RewardPool } from '@/models/RewardPool';

@Component({
    name: 'memberadded',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class MemberAdded extends Vue {
    @Prop() public ev!: MemberAddedEvent;
    @Prop() public pool!: RewardPool;
}
