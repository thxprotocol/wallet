import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import modal from '../components/Modal.vue';
import { BCard, BCardText, BSpinner } from 'bootstrap-vue';

const RewardPool = require('../contracts/RewardPool.json');
const THX = window.THX;

@Component({
    name: 'pools',
    components: {
        modal,
        BCard,
        BCardText,
        BSpinner,
    },
})
export default class Pools extends Vue {
    public uid: string;
    public loading: any = false;
    public pools: any = {};
    public contracts: any = {};
    public poolAddress: any = '';
    public showJoinPoolModal: any = false;

    constructor() {
        super();

        this.uid = firebase.auth().currentUser.uid;

        if (THX.network.hasKeys) {
            this.init();
        }
    }

    init() {

        this.loading = true;

        firebase.database().ref(`users/${this.uid}/pools`).on('child_added', async (s) => {
            const token = THX.network.instances.token;
            const utils = THX.network.loom.utils;
            const hash = RewardPool.networks[9545242630824].transactionHash;
            const receipt = await THX.network.loom.eth.getTransactionReceipt(hash);

            let data = s.val();

            this.contracts[data.address] = await THX.network.contract(RewardPool, data.address);

            data.name = await this.contracts[data.address].methods.name().call();

            if (data.name && receipt) {
                data.outOfSync = (data.address !== receipt.contractAddress);
                data.balance = utils.fromWei(await token.methods.balanceOf(data.address).call(), 'ether');
            }

            this.loading = false;

            Vue.set(this.pools, data.address, data);
        });

        firebase.database().ref(`users/${this.uid}/pools`).on('child_removed', (s: any) => {
            Vue.delete(this.pools, s.key);
        })
    }

    onJoinPool() {
        firebase.database().ref(`users/${this.uid}/pools`).child(this.poolAddress).set({
            address: this.poolAddress
        });

        return this.showJoinPoolModal = false;
    }

    onLeavePool(poolAddress: string) {
        return firebase.database().ref(`users/${this.uid}/pools`).child(poolAddress).remove();
    }

    openPool(poolAddress: string) {
        return this.$router.replace(`/pools/${poolAddress}`);
    }
}