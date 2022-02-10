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
        path: '/signin-oidc',
        component: () => import('../views/SigninRedirect.vue'),
    },
    {
        path: '/silent-renew',
        component: () => import('../views/SilentRenew.vue'),
    },
    {
        path: '/signin',
        component: () => import('../views/Signin.vue'),
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
        path: '/memberships/:id',
        name: 'Membership',
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

    if (to.query.passwordResetToken || to.query.hash || to.query.signup_token || to.query.authentication_token) {
        await store.dispatch('account/signinRedirect', {
            passwordResetToken: to.query.passwordResetToken || null,
            rewardHash: to.query.hash || null,
            signupToken: to.query.signup_token || null,
            token: to.query.authentication_token || null,
            key: to.query.secure_key || null,
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
