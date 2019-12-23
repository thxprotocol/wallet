import { Component, Prop, Vue } from 'vue-property-decorator';
import { Profile } from '../models/Profile';

@Component({
    name: 'ProfilePicture',
})
export default class ProfilePicture extends Vue {
    @Prop() public size!: number;
    @Prop() public profile!: Profile;
}
