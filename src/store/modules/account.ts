import { Module, VuexModule, Action, getModule } from 'vuex-module-decorators';
import { firebaseAction } from 'vuexfire';
import { ProfilePictureData } from '@/models/Account';
import store from '@/store';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';

export interface FirestoreState {
    account: any;
}

@Module({ namespaced: true, name: 'account', store, dynamic: true })
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
        const db = firebase.database();
        const action = firebaseAction(({ bindFirebaseRef }) => {
            return bindFirebaseRef('_account', db.ref(`users/${firebaseUser.uid}`));
        }) as Function; // Call function that firebaseAction returns
        return action(this.context);
    }

    @Action({ rawError: true })
    public setPicture({ name, files }: { name: string; files: File[] }) {
        console.log(name, files);
        return firebase
            .storage()
            .ref(`avatars/${name}`)
            .put(files[0])
            .then(async (s: any) => {
                const url = await s.ref.getDownloadURL();
                const picture = new ProfilePictureData(name, url);

                firebase.database().ref(`users/${this._account.uid}`).update({ picture });
            });
    }
    @Action
    public async removePicture() {
        const pictureRef = firebase.database().ref(`users/${this._account.uid}/picture`);
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

export default getModule(UserModule);
