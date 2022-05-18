import store from '@/store';
import { NavigationGuardNext, Route } from 'vue-router';

export function redirectPasswordResetLink(to: Route) {
    return store.dispatch('account/signinRedirect', {
        passwordResetToken: to.query.passwordResetToken || null,
    });
}

export function redirectLoginLink(to: Route) {
    return store.dispatch('account/signinRedirect', {
        token: to.query.authentication_token || null,
        key: to.query.secure_key || null,
    });
}

export function redirectRewardLink(to: Route) {
    return store.dispatch('account/signinRedirect', {
        rewardHash: to.query.hash || null,
    });
}

export function redirectConfirmationLink(to: Route) {
    return store.dispatch('account/signinRedirect', { signupToken: to.query.signup_token || null });
}

export function redirectSignup() {
    return store.dispatch('account/signupRedirect');
}

export function redirectSignin() {
    return store.dispatch('account/signinRedirect');
}

export function redirectSignout() {
    return store.dispatch('account/signoutRedirect');
}

export function redirectAccount(to: Route, from: Route) {
    return store.dispatch('account/accountRedirect', from.path);
}

export function redirectSigninSilent() {
    return store.dispatch('account/signinSilent');
}

export async function assertAuthorization(to: any, from: any, next: any) {
    const user = await store.dispatch('account/getUser');
    if (!user) return redirectSignin();
    next();
}

export function assertUserAgent(to: Route, from: Route, next: NavigationGuardNext) {
    if (!navigator.userAgent.match('Android.*Version/')) return redirectRewardLink(to);
    next({ path: '/user-agent-warning', query: { hash: to.query.hash }, hash: to.hash });
}
