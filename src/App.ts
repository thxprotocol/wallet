import firebase from '@/firebase';
import { Component, Vue } from 'vue-property-decorator';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import CoinService from './services/CoinService';
import _ from 'lodash';

@Component({
    name: 'App',
    components: {
        Header,
        Footer,
    },
})
export default class App extends Vue {
    private coinService: CoinService = new CoinService();

    public created() {
        firebase.auth.onAuthStateChanged((user: firebase.User | any) => {
            if (user) {
                if (this.$network.extdev) {
                    this.$store.dispatch('account/init', user);
                    this.$store.dispatch('pools/init', user);
                    this.$store.dispatch('notifications/init', user);
                    this.$store.dispatch('balance/init', [this.$network, this.coinService]);
                }
            }
        });
    }
}
