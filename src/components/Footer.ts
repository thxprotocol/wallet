import { Component, Prop, Vue } from 'vue-property-decorator';
import { BNav, BNavItem } from 'bootstrap-vue';
import { mapGetters } from 'vuex';

@Component({
    name: 'Footer',
    components: {
        'b-nav': BNav,
        'b-nav-item': BNavItem,
    },
    computed: {
        ...mapGetters({
            notificationCount: 'notifications/count',
        }),
    },
})
export default class Footer extends Vue {
    private assets: any = {
        wallet: require('../assets/wallet.svg'),
        notifications: require('../assets/notification.svg'),
        account: require('../assets/account.svg'),
        camera: require('../assets/qrcode.svg'),
        pools: require('../assets/community.svg'),
    };
    private notificationCount!: number;

    get routes(): any {
        return (this.$router as any).options.routes.filter((item: any) => item.visible);
    }
}
