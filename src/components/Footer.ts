import { Component, Prop, Vue } from 'vue-property-decorator';
import { BNav, BNavItem } from 'bootstrap-vue';

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
}
