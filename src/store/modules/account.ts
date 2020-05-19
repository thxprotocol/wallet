import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { firebaseAction } from 'vuexfire';
import { ProfilePictureData } from '@/models/Account';
import firebase from '@/firebase';

export interface FirestoreState {
    account: any;
}

@Module({ namespaced: true })
class UserModule extends VuexModule implements FirestoreState {
    private _account: any = null;

    get account(): any {
        if (this._account) {
            this._account.initials = this._account.firstName.charAt(0) + this._account.lastName.charAt(0);
        }
        return this._account;
    }

    @Action
    public init(firebaseUser: firebase.User) {
        const action = firebaseAction(({ bindFirebaseRef }) => {
            return bindFirebaseRef('_account', firebase.db.ref(`users/${firebaseUser.uid}`));
        }) as any; // Call function that firebaseAction returns
        return action(this.context);
    }

    @Action
    public setPicture({ name, files }: { name: string; files: File[] }) {
        return firebase.storage
            .ref(`avatars/${name}`)
            .put(files[0])
            .then(async (s: any) => {
                const url = await s.ref.getDownloadURL();
                const picture = new ProfilePictureData(name, url);

                firebase.db.ref(`users/${this._account.uid}`).update({ picture });
            });
    }

    @Action
    public async removePicture() {
        const pictureRef = firebase.db.ref(`users/${this._account.uid}/picture`);
        const name = (await pictureRef.child('name').once('value')).val();

        firebase.storage
            .ref(`avatars/${name}`)
            .delete()
            .then(() => {
                return pictureRef.remove();
            });
    }

    @Action
    public logout() {
        return firebase.auth.signOut().then(() => {
            this.context.dispatch('reset', null, { root: true });
        });
    }

    @Action
    public login({ email, password }: { email: string; password: string }) {
        return firebase.auth.signInWithEmailAndPassword(email, password);
    }

    @Action
    public reset() {
        console.log('dfdsalk');
        const action = firebaseAction(({ unbindFirebaseRef }) => {
            return unbindFirebaseRef('_account');
        }) as any;
        return action(this.context);
    }
}

export default UserModule;
