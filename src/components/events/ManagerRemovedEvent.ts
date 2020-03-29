import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { ManagerRemovedEvent } from '@/models/RewardPoolEvents';
import { RewardPool } from '@/models/RewardPool';
import ProfilePicture from '@/components/ProfilePicture.vue';
import UserService from '@/services/UserService';

@Component({
    name: 'managerremoved',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class ManagerRemoved extends Vue {
    @Prop() public ev!: ManagerRemovedEvent;
    @Prop() public pool!: RewardPool;
    private userService: UserService = new UserService();
    private member: any = null;

    private created() {
        this.member = this.userService.getMemberByAddress(this.ev.account);
    }
}
