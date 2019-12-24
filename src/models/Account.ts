import { Profile } from './Profile';

export class Account {
    public uid: string = '';
    public profile: Profile | null = null;

    constructor(
        currentUser: firebase.User | any,
    ) {
        if (currentUser) {
            this.uid = currentUser.uid;
            this.profile = new Profile(currentUser.uid);
        }
    }

    public getCoinBalance() {

    }

    public getEthBalance() {

    }
}
