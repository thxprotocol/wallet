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

    constructor() {
        super();
        this.picture = null;
        this.initials = null;
    }

    public created() {
        firebase.database().ref(`users/${this.uid}`)
            .once('value')
            .then((s: any) => {
                this.initials = s.val().firstName.charAt(0) + s.val().lastName.charAt(0);
                this.picture = s.val().picture;
            });
    }
}
