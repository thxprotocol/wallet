import { Vue } from 'vue-property-decorator';
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

Vue.config.productionTip = false;
Vue.use(VueMoment);

let app: any;

firebase.initializeApp(config.firebase[process.env.NODE_ENV as any]);
firebase.auth().onAuthStateChanged((user: firebase.User | any = firebase.auth().currentUser) => {
    if (user) {
        const state: StateService = new StateService(user.uid);

        Vue.prototype.$user = user;
        Vue.prototype.$state = state;
        Vue.prototype.$network = new NetworkService(state.extdevPrivateKey, state.rinkebyPrivateKey);

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
