import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { ManagerAddedEvent, RewardPool } from '@/models/RewardPool';

@Component({
    name: 'manageradded',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class ManagerAdded extends Vue {
    @Prop() public ev!: ManagerAddedEvent;
    @Prop() public pool!: RewardPool;
}
