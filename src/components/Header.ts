import { Component, Vue } from 'vue-property-decorator';
import ProfilePicture from '@/components/ProfilePicture.vue';
import { mapGetters } from 'vuex';

@Component({
    name: 'Header',
    components: {
        'profile-picture': ProfilePicture,
    },
    computed: {
        ...mapGetters({
            account: 'account/account',
            ethRinkebyBalance: 'ethRinkebyBalance',
            tokenRinkebyBalance: 'tokenRinkebyBalance',
            tokenBalance: 'tokenBalance',
        }),
    },
})
export default class Header extends Vue {
    private ethRinkebyBalance!: string;

    get ethBalance() {
        return Number(this.ethRinkebyBalance).toFixed(5);
    }

    public goToAccount() {
        this.$router.replace('/account');
    }
}
