import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import { BSpinner } from 'bootstrap-vue';
import { CryptoUtils } from 'loom-js';

const THX = window.THX;

@Component({
    name: 'register',
    components: {
        BSpinner,
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

    register() {
        this.loading = true;

        if (this.password === this.passwordVerify) {
            this.createAccount();
        }
        else {
            alert("Your passwords do not match.");
        }
    }

    createAccount() {
        firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
            .then((r: any) => {
                const privateKeyArray = CryptoUtils.generatePrivateKey()
                const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKeyArray);
                const account = THX.network.rinkeby.eth.accounts.create();
                const user = {
                    uid: r.user.uid,
                    email: r.user.email,
                    firstName: r.user.firstName,
                    lastName: r.user.lastName,
                    userName: r.user.userName,
                }

                THX.state.loomPrivateKey = privateKeyString;
                THX.state.rinkebyPrivateKey = account.privateKey;
                THX.state.save();

                firebase.database().ref('users').child(user.uid).set(user);

                this.loading = false;
                this.$router.replace('/account');
            })
            .catch((err) => {
                if (typeof err != 'undefined') {
                    alert("Error during account registration.")
                }
                this.loading = false;
            })
    }
}
