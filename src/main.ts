import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ModalPlugin, ToastPlugin } from 'bootstrap-vue';
import Web3 from 'web3';
import { ethers } from 'ethers';

// Set Axios default config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.VUE_APP_API_URL;

// Add a request interceptor
axios.interceptors.request.use((req: AxiosRequestConfig) => {
    const user = store.getters['account/user'];

    if (user) {
        req.headers.common['Authorization'] = `Bearer ${user.access_token}`;
    }

    return req;
});

axios.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            await store.dispatch('account/signoutRedirect');
        }
        throw error;
    },
);

// Set Vue default config and attach plugins
Vue.config.productionTip = false;
Vue.use(ModalPlugin);
Vue.use(ToastPlugin);

// Set custom filters
Vue.filter('fromWei', (value: string) => {
    if (!value) return '';
    value = value.toString();
    return new Web3().utils.fromWei(value);
});

// Set custom filters
Vue.filter('fromBigNumber', (hex: string) => {
    return ethers.utils.formatEther(hex);
});

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
