import { Component, Prop, Vue } from 'vue-property-decorator';
import { BListGroupItem } from 'bootstrap-vue';
import { WithdrawelEvent, RewardPool } from '@/models/RewardPool';
import ProfilePicture from '@/components/ProfilePicture.vue';
// import PoolService from '@/services/PoolService';
// import { Reward } from '@/models/Reward';

@Component({
    name: 'deposit',
    components: {
        'b-list-group-item': BListGroupItem,
        'profile-picture': ProfilePicture,
    },
})
export default class Deposit extends Vue {
    // private reward: Reward | null = null;

    @Prop() public ev!: WithdrawelEvent;
    @Prop() public pool!: RewardPool;

    // created() {
    //     const poolService = new PoolService();
    //     poolService.getReward(this.ev.reward, this.pool)
    //         .then((reward: Reward)=> {
    //             this.reward = reward;
    //             debugger
    //         })
    //     debugger
    // }
}
