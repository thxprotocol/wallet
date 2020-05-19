import firebase from 'firebase/app';
import 'firebase/database';
import { Account } from '@/models/Account';

export default class UserService {
    public async getMemberByAddress(address: string) {
        const snap: any = await firebase.database().ref(`wallets/${address.toLowerCase()}`).once('value');
        const wallet = snap.val();
        if (wallet) {
            const s: any = await firebase.database().ref(`users/${wallet.uid}`).once('value');
            const member = s.val();

            member.address = address.toLowerCase();

            return member;
        }
    }

    public async removeNotification(uid: string, key: string) {
        return await firebase.database().ref(`users/${uid}/notifications/${key}/removed`).set(true);
    }

    public async update(account: Account) {
        return await firebase.database().ref(`users/${account.uid}`).update({
            firstName: account.firstName,
            lastName: account.lastName,
            notifications: account.notifications,
        });
    }

    public async connectSlack(account: Account, slack: string) {
        await firebase.database().ref(`users/${account.uid}`).update({
            slack,
        });
    }

    public async isDuplicateAddress(address: string) {
        const s = await firebase.database().ref(`wallets/${address}`).once('value');

        return s.exists();
    }

    public async updateMapping(address: string, uid: string) {
        return await firebase.database().ref(`wallets/${address}`).child('uid').set(uid);
    }

    public async removeMapping(address: string) {
        return await firebase.database().ref(`wallets/${address}`).remove();
    }
}
