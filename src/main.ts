import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import axios from 'axios';
import { ModalPlugin } from 'bootstrap-vue';
import Web3 from 'web3';

// Set Axios default config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.VUE_APP_API_URL;

// Set Vue default config and attach plugins
Vue.config.productionTip = false;
Vue.use(ModalPlugin);

// Set custom filters
Vue.filter('fromWei', (value: string) => {
    if (!value) return '';
    value = value.toString();
    return new Web3().utils.fromWei(value);
});

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
