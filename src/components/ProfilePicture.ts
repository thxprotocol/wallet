import { Component, Prop, Vue } from 'vue-property-decorator';
import { ProfilePictureData } from '@/models/Account';
import firebase from 'firebase/app';
import 'firebase/database';

@Component({
    name: 'ProfilePicture',
})
export default class ProfilePicture extends Vue {
    @Prop() public size!: string;
    @Prop() public uid!: string;

    public initials: string | null;
    public picture: ProfilePictureData | null;
    public online: boolean = false;

    constructor() {
        super();

        this.picture = null;
        this.initials = null;
    }

    public created() {
        this.getOnline();
        this.getInitials();
        this.getPicture();

        firebase
            .database()
            .ref(`users/${this.uid}`)
            .on('child_changed', (s: any) => {
                if (s.key === 'online') {
                    this.getOnline();
                }
                if (s.key === 'picture') {
                    this.getPicture();
                }
                if (s.key === 'firstName' || s.key === 'lastName') {
                    this.getInitials();
                }
            });
    }

    private async getOnline() {
        const snap = await firebase
            .database()
            .ref(`users/${this.uid}`)
            .once('value');
        this.online = snap.val().online;
    }

    private async getInitials() {
        const snap = await firebase
            .database()
            .ref(`users/${this.uid}`)
            .once('value');
        this.initials = snap.val().firstName.charAt(0) + snap.val().lastName.charAt(0);
    }

    private async getPicture() {
        const snap = await firebase
            .database()
            .ref(`users/${this.uid}`)
            .once('value');
        this.picture = snap.val().picture;
    }
}
