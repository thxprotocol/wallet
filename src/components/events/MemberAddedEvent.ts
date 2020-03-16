import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import { MemberAddedEvent } from '@/models/RewardPoolEvents';
import ProfilePicture from '@/components/ProfilePicture.vue';

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

    public created() {
        console.log('memberadded created');
    }

    public mounted() {
        console.log('memberadded mounted');
    }
}
