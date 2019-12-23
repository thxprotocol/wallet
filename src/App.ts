import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';

import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import EventService from './services/EventService';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

const THX = window.THX;

@Component({
    name: 'App',
    components: {
        Header,
        Footer,
    },
})
export default class App extends Vue {
    public events: any = null;
    public currentUser: any = null;

    public created() {

        this.currentUser = firebase.auth().currentUser;

        if (this.currentUser && THX.network.hasKeys) {
            this.events = new EventService();
            this.events.listen('event.Deposited', this.onPoolDeposit);
            this.events.listen('event.Withdrawn', this.onPoolWithdrawel);
        }
    }

    public toast(title: string, body: string, variant: string) {
        return this.$bvToast.toast(body, {
            title: title,
            toaster: 'b-toaster-bottom-full',
            autoHideDelay: 3000,
            appendToast: true,
            variant: variant,
        })
    }

    public onPoolDeposit(data: any) {
        const timestamp = parseInt(data.detail.created);
        const time = this.$moment(timestamp).format("MMMM Do YYYY, HH:mm");
        const amount = parseInt(new BN(data.detail.amount).div(tokenMultiplier))

        return this.toast(
            'New pool deposit!',
            `${amount} THX deposited by ${data.detail.created} at ${time}.`,
            'info'
        );
    }

    public onPoolWithdrawel(data: any) {
        const timestamp = parseInt(data.detail.created);
        const time = this.$moment(timestamp).format("MMMM Do YYYY, HH:mm");
        const amount = parseInt(new BN(data.detail.amount).div(tokenMultiplier))

        return this.toast('New pool withdrawel!', `${amount} THX withdrawn by ${data.detail.created} at ${time}.`, 'info');
    }
}
