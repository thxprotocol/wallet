import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import {
    assertAuthorization,
    assertUserAgent,
    redirectConfirmationLink,
    redirectLoginLink,
    redirectPasswordResetLink,
    redirectSignin,
    redirectSigninSilent,
    redirectSignout,
    redirectSignup,
} from '@/utils/guards';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        redirect: '/wallet',
    },
    {
        path: '/reset',
        beforeEnter: redirectPasswordResetLink,
    },
    {
        path: '/verify',
        beforeEnter: redirectConfirmationLink,
    },
    {
        path: '/login',
        beforeEnter: redirectLoginLink,
    },
    {
        path: '/claim',
        beforeEnter: assertUserAgent,
    },
    {
        path: '/silent-renew',
        beforeEnter: redirectSigninSilent,
    },
    {
        path: '/signin',
        beforeEnter: redirectSignin,
    },
    {
        path: '/signup',
        beforeEnter: redirectSignup,
    },
    {
        path: '/signout',
        beforeEnter: redirectSignout,
    },
    {
        path: '/signin-oidc',
        component: () => import('../views/SigninRedirect.vue'),
    },
    {
        path: '/user-agent-warning',
        name: 'Warning',
        component: () => import('../views/UserAgentWarning.vue'),
    },
    {
        path: '/memberships/:id',
        name: 'Membership',
        component: () => import('../views/Pool.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/wallet',
        name: 'Wallet',
        component: () => import('../views/Wallet.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/account',
        name: 'Pools',
        component: () => import('../views/Account.vue'),
        beforeEnter: assertAuthorization,
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
