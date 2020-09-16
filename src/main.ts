import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import axios from 'axios';
import { ModalPlugin } from 'bootstrap-vue';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.VUE_APP_API_URL;

Vue.config.productionTip = false;
Vue.use(ModalPlugin);

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
