import { Component, Prop, Vue } from 'vue-property-decorator';
import { BNav, BNavItem } from 'bootstrap-vue';
import { Network } from '@/models/Network';

@Component({
    name: 'Footer',
    components: {
        'b-nav': BNav,
        'b-nav-item': BNavItem,
    },
})
export default class Footer extends Vue {

    get routes(): any {
        return (this.$router as any).options.routes.filter((item: any) => item.visible);
    }
    public amountOfNewRewards: number = 0;
    public assets: any = {
        wallet: require('../assets/wallet.svg'),
        notifications: require('../assets/notification.svg'),
        account: require('../assets/account.svg'),
        camera: require('../assets/qrcode.svg'),
        pools: require('../assets/community.svg'),
    };
    private $network!: Network;

    public created() {
        if (this.$network) {
            this.init();
        }
    }

    public async init() {
        // firebase.database().ref(`users/${uid}/pools`).once('value').then(async s => {
        //     const pools = s.val();
        //
        //     for (let address in pools) {
        //         const pool = await THX.network.poolInstance(p);
        //         debugger
        //         // Start counting the pending reward polls here
        //     }
        // })

        // this.ea.listen('event.RewardStateChanged', this.onRewardStateChange);
        // this.ea.listen('event.RuleStateChanged', this.onRuleStateChange);
        // this.ea.listen('event.clearNotifications', this.clearNotifications);
    }
    public async clearNotifications() {
        // const pool = THX.network.instances.pool;
        // const amountOfRewards = parseInt(await pool.methods.countRewards().call());
        //
        // THX.state.setItem('lastRewardId', amountOfRewards);
    }
    public async onRewardStateChange() {
        // const pool = THX.network.poolInstance();
        // const prevAmountOfRewards = parseInt(this.state.lastRewardId);
        // const currentAmountOfRewards = parseInt(await pool.methods.countRewards().call());
        //
        // this.amountOfNewRewards = currentAmountOfRewards - prevAmountOfRewards;
    }
    public async onRuleStateChange() {

    }
}
