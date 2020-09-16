import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import axios from 'axios';
import { ModalPlugin } from 'bootstrap-vue';
import { maticPOSClient } from './network';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.VUE_APP_API_URL;

Vue.config.productionTip = false;
Vue.use(ModalPlugin);

Vue.prototype.$bridge = maticPOSClient;

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
