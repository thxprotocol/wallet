import { Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/auth';

export class ProfilePicture {
    name: string;
    url: string;

    constructor(
        name: string,
        url: string,
    ) {
        this.name = name;
        this.url = url;
    }
}

export class Profile extends Vue {
    private uid: string;
    public firstName: string = '';
    public lastName: string = '';
    public initials: string = '';
    public email: string = '';
    public picture: ProfilePicture | null;

    constructor(
        uid: string,
    ) {
        super();

        this.uid = uid;
        this.picture = null;

        if (this.uid) {
            firebase.database().ref(`users/${this.uid}`)
                .once('value')
                .then((s: any) => {
                    this.firstName = s.val().firstName;
                    this.lastName = s.val().lastName;
                    this.initials = s.val().firstName.charAt(0) + s.val().lastName.charAt(0);
                    this.picture = s.val().picture;
                    this.email = s.val().email;
                });

            firebase.database().ref(`users/${this.uid}`)
                .on('child_added', (s: any) => {
                    if (s.key === 'picture') {
                        console.log(s.val())
                        Vue.set(this, 'picture', new ProfilePicture(s.val().name, s.val().url))
                    }
                });

            firebase.database().ref(`users/${this.uid}`)
                .on('child_changed', (s: any) => {
                    console.log(s.key);
                    // debugger
                    if (s.key === 'picture') {
                        Vue.set(this, 'picture', new ProfilePicture(s.val().name, s.val().url))
                    }
                });

            firebase.database().ref(`users/${this.uid}`)
                .on('child_removed', (s: any) => {
                    console.log(s.key);
                    // debugger
                    if (s.key === 'picture') {
                        Vue.delete(this, 'picture')
                    }
                });
        }

    }

    public setPicture(name: string, files: File[]) {
        firebase.storage().ref(`avatars/${name}`).put(files[0])
            .then(async (s: any) => {
                const url = await s.ref.getDownloadURL();

                this.picture = new ProfilePicture(name, url);

                firebase.database().ref(`users/${this.uid}`)
                    .update({
                        picture: this.picture,
                    });
            });
    }

    public async removePicture() {
        const pictureRef = firebase.database().ref(`users/${this.uid}/picture`);
        const name = (await pictureRef.child('name').once('value')).val();

        firebase.storage().ref(`avatars/${name}`).delete()
            .then(() => {
                return pictureRef.remove();
            });
    }
}
