import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/auth';
import { BSpinner } from 'bootstrap-vue';

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

    public login() {
        this.loading = true;

        return firebase.auth().signInWithEmailAndPassword(this.email, this.password)
            .then(() => {
                this.loading = false;
                this.$router.replace('/');
            })
            .catch((err) => {
                if (typeof err !== 'undefined') {
                    // eslint-disable-next-line
                    console.error(err.code + ' ' + err.message);
                    alert('Error during authentication');
                }
            });
    }
}
