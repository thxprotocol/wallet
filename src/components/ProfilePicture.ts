import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase';
import 'firebase/database';
import 'firebase/auth';

@Component({
    name: 'ProfilePicture'
})
export default class ProfilePicture extends Vue {
    public account: any = {
        firstName: '',
        lastName: '',
        picture: {
            url: '',
            name: '',
        },
        initials: '',
    };

    @Prop() uid: string | null = null;
    @Prop() size: number | null = null;

    public created() {
        const userRef = firebase.database().ref(`users/${this.uid}`);

        userRef.once('value').then(s => {
            this.account = s.val();

            if (this.account.firstName && this.account.firstName) {
                this.account.initials = this.account.firstName.charAt(0) + this.account.lastName.charAt(0);
            }
        });

        userRef.on('child_added', (s: any) => {
            this.account[s.key] = s.val();
        });

        userRef.on('child_removed', (s) => {
            if (s.key === 'picture') this.account.picture = null;
        });
    }
}