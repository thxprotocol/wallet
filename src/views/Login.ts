import { Component, Vue } from 'vue-property-decorator';
import { BSpinner } from 'bootstrap-vue';
import { VueRouter } from 'vue-router/types/router';

@Component({
    name: 'login',
    components: {
        BSpinner,
    },
})
export default class Login extends Vue {
    public email: string = '';
    public password: string = '';
    public loading: boolean = false;
    public error: string = '';
    public $router!: VueRouter;

    public login() {
        this.loading = true;
        this.$store
            .dispatch('account/login', { email: this.email, password: this.password })
            .then(() => {
                this.loading = false;
                this.$router.push((this.$route.query.redirect as string) || '/account');
            })
            .catch((err) => {
                this.loading = false;
                if (typeof err !== 'undefined') {
                    this.error = err.message;
                    console.error(err.code + ' ' + err.message);
                }
            });
    }
}
