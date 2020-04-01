import firebase from 'firebase/app';
import 'firebase/database';
import NetworkService from '@/services/NetworkService';
import store from '@/store';

export class ProfilePictureData {
    public name: string;
    public url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}

export class Account {
    public $store: any = store;
    public uid!: string;
    public firstName: string = '';
    public lastName: string = '';
    public initials: string = '';
    public email: string = '';
    public picture: ProfilePictureData | null;
    public slack: string = '';
    public online: boolean = false;

    constructor(uid: string) {
        this.uid = uid;
        this.picture = null;

        firebase
            .database()
            .ref(`users/${this.uid}`)
            .once('value')
            .then((s: any) => {
                this.firstName = s.val().firstName;
                this.lastName = s.val().lastName;
                this.initials = s.val().firstName.charAt(0) + s.val().lastName.charAt(0);
                this.picture = s.val().picture;
                this.email = s.val().email;
                this.slack = s.val().slack;

                s.ref
                    .child('online')
                    .onDisconnect()
                    .set(false);

                s.ref.child('online').set(true);
            });
    }

    public setPicture(name: string, files: File[]) {
        firebase
            .storage()
            .ref(`avatars/${name}`)
            .put(files[0])
            .then(async (s: any) => {
                const url = await s.ref.getDownloadURL();
                const picture = new ProfilePictureData(name, url);

                firebase
                    .database()
                    .ref(`users/${this.uid}`)
                    .update({ picture });
            });
    }

    public async removePicture() {
        const pictureRef = firebase.database().ref(`users/${this.uid}/picture`);
        const name = (await pictureRef.child('name').once('value')).val();

        firebase
            .storage()
            .ref(`avatars/${name}`)
            .delete()
            .then(() => {
                return pictureRef.remove();
            });
    }
}
