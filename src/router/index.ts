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
    redirectAccount,
    redirectSignout,
    redirectSignup,
} from '@/utils/guards';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        redirect: '/memberships',
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
        path: '/account',
        beforeEnter: redirectAccount,
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
        path: '/wallet',
        name: 'Wallet',
        component: () => import('../views/Wallet.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/payment',
        name: 'Payment',
        component: () => import('../views/Payment.vue'),
    },
    {
        path: '/claims',
        name: 'Claim',
        component: () => import('../views/Claim.vue'),
    },
    {
        path: '/memberships',
        name: 'Pools',
        component: () => import('../views/Memberships.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/memberships/:id',
        redirect: '/memberships/:id/withdrawals',
    },
    {
        path: '/memberships/:id/withdrawals',
        name: 'Withdrawals',
        component: () => import('../views/memberships/Withdrawals.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/memberships/:id/promotions',
        name: 'Promotions',
        component: () => import('../views/memberships/Promotions.vue'),
        beforeEnter: assertAuthorization,
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
