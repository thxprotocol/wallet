import { Vue } from 'vue-property-decorator';
import VueTimers from 'vue-timers';
import VueMoment from 'vue-moment';
import App from './App.vue';
import firebase from 'firebase/app';
import 'firebase/auth';
import router from './router';
import store from './store';
import StateService from './services/StateService';
import NetworkService from './services/NetworkService';
import config from './config.json';
import './registerServiceWorker';
import './custom.scss';
import { ModalPlugin } from 'bootstrap-vue';
import UserService from '@/services/UserService';
import PoolService from '@/services/PoolService';

Vue.use(VueTimers);
Vue.config.productionTip = false;
Vue.use(VueMoment);
Vue.use(ModalPlugin);

let app: any;

firebase.initializeApp(config.firebase[process.env.NODE_ENV as any]);
firebase.auth().onAuthStateChanged((user: firebase.User | any = firebase.auth().currentUser) => {
    if (user) {
        const state: StateService = new StateService(user.uid);
        const stateService: StateService = new StateService(user.uid);
        const poolService = new PoolService();
        const userService = new UserService();
        const networkService = new NetworkService(stateService.extdevPrivateKey, stateService.rinkebyPrivateKey);

        Vue.prototype.$user = user;
        Vue.prototype.$users = userService;
        Vue.prototype.$pools = poolService;
        Vue.prototype.$state = stateService;
        Vue.prototype.$network = networkService;

        if (!state.rinkebyPrivateKey) {
            console.warn(
                'It looks like you misconfigured your rinkeby private key. Provide it through the accounts page.',
            );
        }
        if (!state.extdevPrivateKey) {
            console.warn(
                'It looks like you misconfigured your extdev private key. Provide it through the accounts page.',
            );
        }
    } else {
        Vue.prototype.$network = new NetworkService();
    }

    if (!app) {
        app = new Vue({
            router,
            store,
            render: (h) => h(App),
        }).$mount('#app');
    }
});
