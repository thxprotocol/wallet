import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { ManagerRemovedEvent, RewardPool } from '@/models/RewardPool';

@Component({
    name: 'managerremoved',
    components: {
        'b-list-group-item': BListGroupItem,
    },
})
export default class ManagerRemoved extends Vue {
    @Prop() public ev!: ManagerRemovedEvent;
    @Prop() public pool!: RewardPool;
}
