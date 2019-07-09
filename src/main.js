import Vue from 'vue'
import VueQrcodeReader from 'vue-qrcode-reader';
import App from './App.vue'
import router from './router'
import firebase from 'firebase/app';
import 'firebase/auth';
import config from './config.js';

Vue.use(VueQrcodeReader);

Vue.config.productionTip = false

let app;

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
