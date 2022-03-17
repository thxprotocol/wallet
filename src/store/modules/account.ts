import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { User, UserManager } from 'oidc-client';
import { config } from '@/utils/oidc';
import { getPrivateKeyForUser } from '@/utils/torus';
import { isPrivateKey } from '@/utils/network';
import { BASE_URL } from '@/utils/secrets';

export interface UserProfile {
    address: string;
    privateKey: string;
}

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    userManager: UserManager = new UserManager(config);
    _user!: User;
    _profile: UserProfile | null = null;
    _privateKey = '';

    get user() {
        return this._user;
    }

    get privateKey() {
        if (!this._user) return;

        const encoded = sessionStorage.getItem(`thx:wallet:user:${this._user.profile.sub}`) as string;
        const decoded = atob(encoded);

        return this._privateKey || decoded;
    }

    get profile() {
        return this._profile;
    }

    @Mutation
    setUser(user: User) {
        this._user = user;
    }

    @Mutation
    setPrivateKey({ sub, privateKey }: { sub: string; privateKey: string }) {
        sessionStorage.setItem(`thx:wallet:user:${sub}`, btoa(privateKey));

        this._privateKey = privateKey;
    }

    @Mutation
    setUserProfile(profile: UserProfile) {
        this._profile = profile;
    }

    @Action
    async getUser() {
        try {
            const user = await this.userManager.getUser();

            this.context.commit('setUser', user);

            return user;
        } catch (e) {
            return e;
        }
    }

    @Action
    async getProfile() {
        try {
            const r = await axios({
                method: 'GET',
                url: '/account',
            });

            if (r.status !== 200) {
                return { error: Error('GET /account failed.') };
            }

            this.context.commit('setUserProfile', r.data);

            return { profile: r.data };
        } catch (error) {
            return { error };
        }
    }

    @Action
    async getPrivateKey(user: User) {
        try {
            const privateKey = await getPrivateKeyForUser(user);

            if (privateKey && isPrivateKey(privateKey)) {
                this.context.commit('setPrivateKey', { sub: this.user.profile.sub, privateKey });
            }

            return { privateKey };
        } catch (error) {
            return { error };
        }
    }

    @Action
    async update(data: UserProfile) {
        try {
            const r = await axios({
                method: 'PATCH',
                url: '/account',
                data,
            });

            if (r.status !== 200) {
                throw Error('PATCH /account failed.');
            }

            this.context.commit('setUserProfile', r.data);
            return { account: r.data };
        } catch (error) {
            return { error };
        }
    }

    @Action
    async signinRedirect(
        payload: {
            signupToken?: string;
            rewardHash?: string;
            token?: string;
            key?: string;
            passwordResetToken?: string;
        } = {},
    ) {
        try {
            const extraQueryParams: any = {
                return_url: BASE_URL,
            };

            if (payload.signupToken) {
                extraQueryParams['prompt'] = 'confirm';
                extraQueryParams['signup_token'] = payload.signupToken;
            }

            if (payload.passwordResetToken) {
                extraQueryParams['prompt'] = 'reset';
                extraQueryParams['password_reset_token'] = payload.passwordResetToken;
            }

            if (payload.token) {
                extraQueryParams['authentication_token'] = payload.token.replace(/\s/g, '+');
            }

            if (payload.key) {
                extraQueryParams['secure_key'] = payload.key.replace(/\s/g, '+');
            }

            if (payload.rewardHash) {
                extraQueryParams['reward_hash'] = payload.rewardHash;
            }

            await this.userManager.clearStaleState();

            return await this.userManager.signinRedirect({
                state: { toPath: window.location.href, rewardHash: payload.rewardHash },
                extraQueryParams,
            });
        } catch (e) {
            return { error: e };
        }
    }

    @Action
    async signinRedirectCallback() {
        try {
            const user = await this.userManager.signinRedirectCallback();

            this.context.commit('setUser', user);

            return user;
        } catch (e) {
            return { error: e };
        }
    }

    @Action
    async signupRedirect() {
        try {
            await this.userManager.clearStaleState();

            return await this.userManager.signinRedirect({
                prompt: 'create',
                extraQueryParams: { return_url: BASE_URL },
            });
        } catch (e) {
            return e;
        }
    }

    @Action
    async accountRedirect() {
        try {
            await this.userManager.signinRedirect({
                extraQueryParams: { prompt: 'account-settings', return_url: BASE_URL + '/integrations' },
            });
        } catch (e) {
            return e;
        }
    }

    @Action
    async signoutRedirect() {
        try {
            await this.userManager.signoutRedirect({});
        } catch (e) {
            return e;
        }
    }

    @Action
    async signinSilent() {
        try {
            return await this.userManager.signinSilent();
        } catch (e) {
            return { error: e };
        }
    }
}

export default AccountModule;
