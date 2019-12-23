import Vue from 'vue';
import VueMoment from 'vue-moment';

import App from './App.vue'
import firebase from 'firebase/app';
import 'firebase/auth';

import router from './router';
import store from './store';
import './registerServiceWorker';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './custom.scss';

import { Account } from './models/Account';
import { Network } from './models/Network';

import StateService from './services/StateService';

const config = require('./config.js');

Vue.config.productionTip = false;
Vue.use(VueMoment);

let app: any;

firebase.initializeApp(config.firebase);
firebase.auth()
    .onAuthStateChanged(function() {
        const currentUser: firebase.User | any = firebase.auth().currentUser;
        const state: StateService = new StateService(currentUser.uid);

        Vue.prototype.$account = new Account(currentUser);
        Vue.prototype.$state = state;
        Vue.prototype.$network = new Network(
            state.extdevPrivateKey,
            state.rinkebyPrivateKey,
        );

        if (!state.rinkebyPrivateKey) {
            console.warn('It looks like you misconfigured your rinkeby private key. Provide it through the accounts page.')
        }
        if (!state.extdevPrivateKey) {
            console.warn('It looks like you misconfigured your extdev private key. Provide it through the accounts page.')
        }

        if (!app) {
            app = new Vue({
                router,
                store,
                render: (h) => h(App),
            }).$mount('#app');
        }
    });
