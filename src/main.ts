import { Vue } from 'vue-property-decorator';
import VueTimers from 'vue-timers';
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
import { ModalPlugin } from 'bootstrap-vue';
import UserService from '@/services/UserService';
import PoolService from '@/services/PoolService';

import Matic from '@maticnetwork/maticjs';
import HDWalletProvider from '@truffle/hdwallet-provider';

Vue.use(VueTimers);
Vue.config.productionTip = false;
Vue.use(VueMoment);
Vue.use(ModalPlugin);

let app: any;

firebase.initializeApp(config.firebase[process.env.NODE_ENV as any]);
firebase.auth().onAuthStateChanged(async (user: firebase.User | any = firebase.auth().currentUser) => {
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

        let tx, mumbaiBalance, goerliBalance;
        // const GOERLI_ACCOUNT = '0xF986ed06Bc54227e5E28E6aC93F34fc0Fac497eB';
        // const GOERLI_TOKEN = '0x3f152B63Ec5CA5831061B2DccFb29a874C317502';
        const GOERLI_TOKEN = '0x24EB81d800786fFAD0F26611868B8d8a02303790';
        const MUMBAI_ACCOUNT = '0x86C0F290b7bdf02946D115c00a0A6ae543379544';
        // const MUMBAI_TOKEN = '0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e';
        const MUMBAI_TOKEN = '0x6EC9cF44A185102b9A312dae7C8f6D8961C0E020';
        const amount = 1000000000000000000;
        const parentProvider = new HDWalletProvider(
            '0x4a5f684bade60056c0cc23c7ec55dd7bc283c5530e61ef04930a00b05636f897',
            'https://goerli.infura.io/v3/350a0215b02e46639ff2ac1982de4aed',
        );
        const maticProvider = new HDWalletProvider(
            '0x3445ebd670b5402e710f68425c9f5d10de4d59e7f6dd09bfd24144efa2e4d4cf',
            'https://rpc-mumbai.matic.today',
        );
        const matic = new Matic({
            parentProvider,
            maticProvider,
            parentDefaultOptions: {
                from: MUMBAI_ACCOUNT,
            },
            maticDefaultOptions: {
                from: MUMBAI_ACCOUNT,
            },
            posRootChainManager: '0x2890bA17EfE978480615e330ecB65333b880928e',
        });

        matic.initialize();

        async function getBalances() {
            mumbaiBalance = await matic.balanceOfERC20(MUMBAI_ACCOUNT, MUMBAI_TOKEN, { parent: false });
            goerliBalance = await matic.balanceOfERC20(MUMBAI_ACCOUNT, GOERLI_TOKEN, { parent: true });

            console.log(`Goerli Balance:`, goerliBalance);
            console.log(`Mumbai Balance:`, mumbaiBalance);
        }

        await getBalances();
        debugger;
        tx = await matic.approveERC20TokensForDeposit(GOERLI_TOKEN, amount);
        console.log(`TX ERC20 Approve on Goerli:`, tx);

        tx = await matic.depositERC20ForUser(GOERLI_TOKEN, MUMBAI_ACCOUNT, amount, {
            from: MUMBAI_ACCOUNT,
            gasPrice: '10000000000',
        });
        console.log(`TX ERC20 Deposit on Goerli:`, tx);

        await getBalances();

        debugger;
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
