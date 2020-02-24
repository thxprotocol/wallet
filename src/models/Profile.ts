import { Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/auth';

export class ProfilePictureData {
    public name: string;
    public url: string;

    constructor(
        name: string,
        url: string,
    ) {
        this.name = name;
        this.url = url;
    }
}

export class Profile extends Vue {
    public firstName: string = '';
    public lastName: string = '';
    public initials: string = '';
    public email: string = '';
    public picture: ProfilePictureData | null;
    public slack: string = '';
    private uid: string;

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
                    this.slack = s.val().slack;
                });

            firebase.database().ref(`users/${this.uid}`)
                .on('child_added', (s: any) => {
                    if (s.key === 'picture') {
                        Vue.set(this, 'picture', new ProfilePictureData(s.val().name, s.val().url));
                    }

                    if (s.key === 'slack') {
                        Vue.set(this, 'slack', s.val());
                    }
                });

            firebase.database().ref(`users/${this.uid}`)
                .on('child_changed', (s: any) => {
                    if (s.key === 'picture') {
                        Vue.set(this, 'picture', new ProfilePictureData(s.val().name, s.val().url));
                    }
                    if (s.key === 'slack') {
                        Vue.set(this, 'slack', s.val());
                    }
                });

            firebase.database().ref(`users/${this.uid}`)
                .on('child_removed', (s: any) => {
                    if (s.key === 'picture') {
                        Vue.set(this, 'picture', null);
                    }
                    if (s.key === 'slack') {
                        Vue.set(this, 'slack', null);
                    }
                });
        }

    }

    public setPicture(name: string, files: File[]) {
        firebase.storage().ref(`avatars/${name}`).put(files[0])
            .then(async (s: any) => {
                const url = await s.ref.getDownloadURL();

                this.picture = new ProfilePictureData(name, url);

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
