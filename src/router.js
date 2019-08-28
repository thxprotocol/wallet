import Vue from 'vue';
import VueRouter from 'vue-router';
import firebase from 'firebase/app';
import Wallet from './views/Wallet.vue';
import Notifications from './views/Notifications.vue';
import Account from './views/Account.vue';
import Login from './views/Login.vue';
import Logout from './views/Logout.vue';
import Register from './views/Register.vue';
import Camera from './views/Camera.vue';
import Pools from './views/Pools.vue';
import Pool from './views/Pool.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [{
        path: '/pools',
        name: 'pools',
        component: Pools,
        visible: true,
        meta: {
            header: true,
            requiresAuth: true
        }
    }, {
        path: '/pools/:id',
        name: 'pool',
        component: Pool,
        visible: false,
        props: true,
        meta: {
            header: true,
            requiresAuth: true
        }
    }, {
        path: '/',
        name: 'wallet',
        component: Wallet,
        visible: true,
        meta: {
            header: true,
            requiresAuth: true
        }
    }, {
        path: '/notifications',
        name: 'notifications',
        component: Notifications,
        visible: true,
        meta: {
            header: false,
            requiresAuth: true
        }
    }, {
        path: '/camera',
        name: 'camera',
        component: Camera,
        visible: true,
        meta: {
            header: false,
            requiresAuth: true
        }
    }, {
        path: '/account',
        name: 'account',
        component: Account,
        visible: false,
        meta: {
            header: true,
            requiresAuth: true
        }
    }, {
        name: 'login',
        path: '/login',
        component: Login
    }, {
        name: 'logout',
        path: '/logout',
        component: Logout
    }, {
        name: 'register',
        path: '/register',
        component: Register
    }]
})

router.beforeEach((to, from, next) => {
    let currentUser = firebase.auth().currentUser;
    let requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !currentUser)
        next('login')
    else
        next()
});

export default router;
