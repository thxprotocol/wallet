import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { ManagerAddedEvent, RewardPool } from '@/models/RewardPool';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'manageradded',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class ManagerAdded extends Vue {
    @Prop() public ev!: ManagerAddedEvent;
    @Prop() public pool!: RewardPool;
}
