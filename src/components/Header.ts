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
            ethRinkebyBalance: 'ethRinkebyBalance',
            tokenRinkebyBalance: 'tokenRinkebyBalance',
            tokenBalance: 'tokenBalance',
        }),
    },
})
export default class Header extends Vue {
    public goToAccount() {
        this.$router.replace('/account');
    }
}
