import Vue from 'vue'
import VueQrcodeReader from 'vue-qrcode-reader';
import VueMoment from 'vue-moment';

import { BVToastPlugin } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './custom.scss';

import App from './App.vue'
import router from './router'
import firebase from 'firebase/app';
import 'firebase/auth';
import config from './config.js';

import StateService from './services/StateService';
import NetworkService from './services/NetworkService';

/*global THX*/
window.THX = {};
THX.state = new StateService();

const loomPrivateKey = THX.state.loomPrivateKey;
const rinkebyPrivateKey = THX.state.rinkebyPrivateKey;

THX.network = new NetworkService(
    loomPrivateKey ? loomPrivateKey : config.ganache.private,
    rinkebyPrivateKey ? rinkebyPrivateKey : config.rinkeby.private,
);

THX.network.init()
    .then(instances => {
        // eslint-disable-next-line
        console.info(`Initialized instances `, instances)
    })
    .catch((err) => {
        // eslint-disable-next-line
        console.error(err);
    });

let app;

Vue.use(VueMoment);
Vue.use(VueQrcodeReader);
Vue.use(BVToastPlugin);
Vue.config.productionTip = false

firebase.initializeApp(config.firebase);
firebase.auth().onAuthStateChanged(function() {
    if (!app) {
        app = new Vue({
            el: '#app',
            render: h => h(App),
            router
        });
    }
});
