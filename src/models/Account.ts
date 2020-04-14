import firebase from 'firebase/app';
import 'firebase/database';

export class ProfilePictureData {
    public name: string;
    public url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}

export class Account {
    public uid!: string;
    public firstName: string = '';
    public lastName: string = '';
    public initials: string = '';
    public email: string = '';
    public picture: ProfilePictureData | null;
    public slack: string = '';
    public online: boolean = false;
    public notifications: { [key: string]: { pool: string; removed: boolean } } = {};

    constructor(uid: string) {
        this.uid = uid;
        this.picture = null;

        firebase
            .database()
            .ref(`users/${this.uid}`)
            .once('value')
            .then((s: any) => {
                const data = s.val();

                this.firstName = data.firstName || '';
                this.lastName = data.lastName || '';
                this.initials = data.firstName.charAt(0) + s.val().lastName.charAt(0);
                this.picture = data.picture;
                this.email = data.email;
                this.slack = data.slack;
                this.notifications = data.notifications || {};

                s.ref.child('online').onDisconnect().set(false);
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

                firebase.database().ref(`users/${this.uid}`).update({ picture });
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
