import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import BN from 'bn.js';
import { DepositEvent, RewardPool } from '@/models/RewardPool';
import ProfilePicture from '@/components/ProfilePicture.vue';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'memberremoved',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class MemberRemoved extends Vue {
    @Prop() public ev!: DepositEvent;
    @Prop() public pool!: RewardPool;
}
