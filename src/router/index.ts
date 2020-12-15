import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import store from '../store';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        component: () => import('../views/Home.vue'),
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/login',
        component: () => import('../views/Login.vue'),
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
    },
    {
        path: '/wallet',
        name: 'Wallet',
        component: () => import('../views/Wallet.vue'),
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/account',
        name: 'Account',
        component: () => import('../views/Account.vue'),
        meta: {
            requiresAuth: true,
        },
    },
];

const router = new VueRouter({
    routes,
});

router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    try {
        const { auth } = await store.dispatch('account/init');

        if (requiresAuth && !auth) {
            next('/login');
        } else {
            return next();
        }
    } catch (err) {
        console.error(err);
    }
});

export default router;
