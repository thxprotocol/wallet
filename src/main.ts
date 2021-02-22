import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Web3 from 'web3';
import { ModalPlugin, ToastPlugin } from 'bootstrap-vue';
import { ethers } from 'ethers';
import './main.scss';
import './registerServiceWorker';
import VueClipboard from 'vue-clipboard2';

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

// Add a response interceptor
axios.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            const user = await store.dispatch('account/getUser');
            if (user) {
                // Token expired or invalid, signout id_token_hint
                await store.dispatch('account/signoutRedirect');
            } else {
                // id_token_hint not available, force signout and request signin
                await store.dispatch('account/signout');
                await store.dispatch('account/signinRedirect');
            }
        }
        throw error;
    },
);

// Set Vue default config and attach plugins
Vue.config.productionTip = false;

// Sets a container to fix issues related to bootstrap modals
VueClipboard.config.autoSetContainer = true;

Vue.use(ModalPlugin);
Vue.use(ToastPlugin);
Vue.use(VueClipboard);

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
