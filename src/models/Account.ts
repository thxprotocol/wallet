import { Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import NetworkService from '@/services/NetworkService';
import BN from 'bn.js';
import store from '@/store';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class ProfilePictureData {
    public name: string;
    public url: string;

    constructor(
        name: string,
        url: string,
    ) {
        this.name = name;
        this.url = url;
    }
}

export class Account {
    public $store: any = store;
    public uid!: string;
    public firstName: string = '';
    public lastName: string = '';
    public initials: string = '';
    public email: string = '';
    public picture: ProfilePictureData | null;
    public slack: string = '';
    private $network!: NetworkService;

    constructor(uid: string) {
        this.uid = uid;
        this.picture = null;

        firebase.database().ref(`users/${this.uid}`)
            .once('value')
            .then((s: any) => {
                this.firstName = s.val().firstName;
                this.lastName = s.val().lastName;
                this.initials = s.val().firstName.charAt(0) + s.val().lastName.charAt(0);
                this.picture = s.val().picture;
                this.email = s.val().email;
                this.slack = s.val().slack;
            });

    }

    public setPicture(name: string, files: File[]) {
        firebase.storage().ref(`avatars/${name}`).put(files[0])
            .then(async (s: any) => {
                const url = await s.ref.getDownloadURL();
                const picture = new ProfilePictureData(name, url);

                firebase.database().ref(`users/${this.uid}`)
                    .update({ picture });
            });
    }

    public async removePicture() {
        const pictureRef = firebase.database().ref(`users/${this.uid}/picture`);
        const name = (await pictureRef.child('name').once('value')).val();

        firebase.storage().ref(`avatars/${name}`).delete()
            .then(() => {
                return pictureRef.remove();
            });
    }

    public async getRinkebyCoinBalance() {
        if (this.$network.rinkeby) {
            const address = this.$network.rinkeby.account.address;
            const web3js = this.$network.rinkeby.web3js;
            const balanceInWei = await this.$network.getRinkebyCoinBalance(web3js, address);

            return new BN(balanceInWei).div(TOKEN_MULTIPLIER);
        } else {
            return new BN(0);
        }
    }

    public async getExtdevCoinBalance() {
        if (this.$network.extdev) {
            const address = this.$network.extdev.account;
            const web3js = this.$network.extdev.web3js;
            const balanceInWei = await this.$network.getExtdevCoinBalance(web3js, address);

            return new BN(balanceInWei).div(TOKEN_MULTIPLIER);
        } else {
            return new BN(0);
        }
    }

    public async getEthBalance() {
        if (this.$network.rinkeby) {
            const address = this.$network.rinkeby.account.address;
            const balanceInWei = await this.$network.rinkeby.web3js.eth.getBalance(address);
            const utils = this.$network.web3js.utils;

            return Math.floor(utils.fromWei(balanceInWei) * 100000) / 100000;
        } else {
            return new BN(0);
        }
    }

}
