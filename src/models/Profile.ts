import { Vue } from 'vue-property-decorator';
import firebase from 'firebase';
import 'firebase/database';
import 'firebase/auth';

export class Profile extends Vue {
    public firstName: string = '';
    public lastName: string = '';
    public initials: string = '';
    public email: string = '';
    public picture: {
        name: string,
        url: string,
    } | null = null;

    constructor(
        uid: string,
    ) {
        super();
        
        if (uid) {
            firebase.database().ref(`users/${uid}`)
                .once('value').then((s: any) => {
                    this.firstName = s.val().firstName;
                    this.lastName = s.val().lastName;
                    this.initials = s.val().firstName.charAt(0) + s.val().lastName.charAt(0);
                    console.log(this.initials)
                    this.picture = s.val().picture;
                    this.email = s.val().email;
                });

            firebase.database().ref(`users/${uid}`)
                .on('child_added', (s: any) => {
                    if (s.key === 'picture') {
                        Vue.set(this, s.key, s.val());
                    }
                });

            firebase.database().ref(`users/${uid}`)
                .on('child_removed', (s: any) => {
                    if (s.key === 'picture') {
                        Vue.set(this, s.key, null);
                    }
                });
        }

    }
}
