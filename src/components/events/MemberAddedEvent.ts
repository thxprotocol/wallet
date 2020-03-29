import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import { MemberAddedEvent } from '@/models/RewardPoolEvents';
import ProfilePicture from '@/components/ProfilePicture.vue';
import UserService from '@/services/UserService';

@Component({
    name: 'memberadded',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class MemberAdded extends Vue {
    @Prop() public ev!: MemberAddedEvent;
    @Prop() public pool!: RewardPool;
    private userService: UserService = new UserService();
    private member: any = null;

    private async created() {
        this.member = await this.userService.getMemberByAddress(this.ev.account);
    }
}
