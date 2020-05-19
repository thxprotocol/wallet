import { Vue } from 'vue-property-decorator';

import VueTimers from 'vue-timers';
import VueMoment from 'vue-moment';
import { ModalPlugin } from 'bootstrap-vue';

import App from './App.vue';

import router from './router';
import store from './store';

import StateService from './services/StateService';
import NetworkService from './services/NetworkService';
import UserService from '@/services/UserService';
import PoolService from '@/services/PoolService';

import firebase from '@/firebase';

import './registerServiceWorker';
import './custom.scss';

Vue.config.productionTip = false;

Vue.use(VueTimers);
Vue.use(VueMoment);
Vue.use(ModalPlugin);

let app: any;

firebase.auth.onAuthStateChanged((user: firebase.User | any) => {
    if (user) {
        const stateService: StateService = new StateService(user.uid);
        const poolService = new PoolService();
        const userService = new UserService();
        const networkService = new NetworkService(stateService.extdevPrivateKey, stateService.rinkebyPrivateKey);

        Vue.prototype.$users = userService;
        Vue.prototype.$pools = poolService;
        Vue.prototype.$state = stateService;
        Vue.prototype.$network = networkService;

        if (!stateService.rinkebyPrivateKey) {
            console.warn(
                'It looks like you misconfigured your rinkeby private key. Provide it through the accounts page.',
            );
        }
        if (!stateService.extdevPrivateKey) {
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
