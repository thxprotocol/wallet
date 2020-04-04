import { Component, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import { BSpinner } from 'bootstrap-vue';

@Component({
    name: 'register',
    components: {
        'b-spinner': BSpinner,
    },
})
export default class Register extends Vue {
    public firstName: any = '';
    public lastName: any = '';
    public email: any = '';
    public password: any = '';
    public passwordVerify: any = '';
    public loading: any = false;

    constructor() {
        super();
    }

    public register() {
        this.loading = true;

        if (this.password === this.passwordVerify) {
            this.createAccount();
        } else {
            alert('Your passwords do not match.');
        }
    }

    public createAccount() {
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.email, this.password)
            .then((r: any) => {
                const user = {
                    uid: r.user.uid,
                    email: r.user.email,
                    firstName: this.firstName,
                    lastName: this.lastName,
                };

                firebase
                    .database()
                    .ref('users')
                    .child(user.uid)
                    .set(user);

                this.loading = false;
                this.$router.replace('/account');
            })
            .catch((err: string) => {
                if (typeof err !== 'undefined') {
                    alert(`Error: ${err}`);
                }
                this.loading = false;
            });
    }
}
