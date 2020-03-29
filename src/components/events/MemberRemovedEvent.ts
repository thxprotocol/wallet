import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import BN from 'bn.js';
import { RewardPool } from '@/models/RewardPool';
import { ManagerRemovedEvent } from '@/models/RewardPoolEvents';
import ProfilePicture from '@/components/ProfilePicture.vue';
import UserService from '@/services/UserService';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'memberremoved',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class MemberRemoved extends Vue {
    @Prop() public ev!: ManagerRemovedEvent;
    @Prop() public pool!: RewardPool;
    private userService: UserService = new UserService();
    private member: any = null;

    private created() {
        this.member = this.userService.getMemberByAddress(this.ev.account);
    }
}
