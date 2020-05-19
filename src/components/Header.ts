import { Component, Vue } from 'vue-property-decorator';
import ProfilePicture from '@/components/ProfilePicture.vue';
import { mapGetters, mapState } from 'vuex';
import BN from 'bn.js';

@Component({
    name: 'Header',
    components: {
        'profile-picture': ProfilePicture,
    },
    computed: {
        ...mapGetters({
            account: 'account/account',
        }),
        ...mapState('balance', ['eth', 'tokenRinkeby', 'token']),
    },
})
export default class Header extends Vue {
    private ethRinkeby!: BN;

    get ethBalance() {
        return Number(this.ethRinkeby).toFixed(5);
    }

    public goToAccount() {
        this.$router.replace('/account');
    }
}
