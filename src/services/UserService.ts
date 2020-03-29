import firebase from 'firebase/app';
import 'firebase/database';
import { Vue } from 'vue-property-decorator';
import { Account } from '@/models/Account';

export default class UserService extends Vue {

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

    public async connectSlack(account: Account, slack: string) {
        await firebase.database().ref(`users/${account.uid}`)
            .update({
                slack,
            });
    }
}
