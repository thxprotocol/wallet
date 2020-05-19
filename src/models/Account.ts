import firebase from '@/firebase';

export class ProfilePictureData {
    public name: string;
    public url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}

export class Account {
    public uid: string;
    public address: string;
    public firstName: string = '';
    public lastName: string = '';
    public initials: string = '';
    public email: string = '';
    public picture: ProfilePictureData | null;
    public slack: string = '';
    public online: boolean = false;
    public notifications: { [key: string]: { pool: string; removed: boolean } } = {};

    constructor(uid: string, address: string = '') {
        this.uid = uid;
        this.picture = null;
        this.address = address;

        firebase.db
            .ref(`users/${this.uid}`)
            .once('value')
            .then((s: any) => {
                const data = s.val();

                this.firstName = data.firstName || '';
                this.lastName = data.lastName || '';
                this.initials = data.firstName.charAt(0) + data.lastName.charAt(0);
                this.picture = data.picture;
                this.email = data.email;
                this.slack = data.slack;
                this.notifications = data.notifications || {};

                s.ref.child('online').onDisconnect().set(false);
                s.ref.child('online').set(true);
            });
    }
}
