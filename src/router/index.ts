import store from '@/store';
import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

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
        component: () => import('../views/Signin.vue'),
    },
    {
        path: '/signin-oidc',
        component: () => import('../views/SigninRedirect.vue'),
    },
    {
        path: '/silent-renew',
        component: () => import('../views/SilentRenew.vue'),
    },
    {
        path: '/signup',
        name: 'Signup',
        component: () => import('../views/Signup.vue'),
    },
    {
        path: '/verify',
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/claim/:symbol',
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/pools/:address',
        component: () => import('../views/Pool.vue'),
        meta: {
            requiresAuth: true,
        },
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
    mode: 'history',
    routes,
});

router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (to.query.signupToken || to.query.passwordResetToken || to.query.hash) {
        await store.dispatch('account/signinRedirect', {
            signupToken: to.query.signup_token || null,
            passwordResetToken: to.query.passwordResetToken,
            rewardHash: to.query.hash || null,
        });
    }

    try {
        const user = await store.dispatch('account/getUser');

        if (requiresAuth && !user) {
            await store.dispatch('account/signinRedirect', {});
        } else {
            return next();
        }
    } catch (err) {
        console.error(err);
    }
});

export default router;
