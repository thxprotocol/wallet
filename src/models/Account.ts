import { Profile } from './Profile';

export class Account {
    public uid: string | null = '';
    public profile: Profile | null = null;
    public rinkebyAddress: string = '';
    public extdevAddress: string = '';

    constructor(
        currentUser: firebase.User | any
    ) {
        if (currentUser) {
            this.uid = currentUser.uid;
            this.profile = new Profile(currentUser.uid);
        }
    }
}