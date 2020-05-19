import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'logout',
})
export default class Logout extends Vue {
    public mounted() {
        this.$store.dispatch('account/logout').then(() => {
            this.$router.replace('login');
        });
    }
}
