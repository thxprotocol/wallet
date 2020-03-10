import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import { WithdrawelEvent } from '@/models/RewardPoolEvents';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'deposit',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class Deposit extends Vue {
    @Prop() public ev!: WithdrawelEvent;
    @Prop() public pool!: RewardPool;
}
