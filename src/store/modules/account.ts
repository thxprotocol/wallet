import axios from 'axios';
import TorusSdk, { TorusKey } from '@toruslabs/torus-direct-web-sdk';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { User, UserManager } from 'oidc-client';
import { ethers } from 'ethers';
import { decryptString } from '@/utils/decrypt';

interface AuthObject {
    email: string;
    password: string;
}

export class SignupRequest {
    firstName!: string;
    lastName!: string;
    email!: string;
    address!: string;
}

export class Account {
    privateKey = '';
    address = '';
    email = '';
    firstName = '';
    lastName = '';
    assetPools: string[] = [];
    burnProofs: string[] = [];
}

const config: any = {
    authority: process.env.VUE_APP_API_ROOT,
    client_id: process.env.VUE_APP_OIDC_CLIENT_ID, // eslint-disable-line @typescript-eslint/camelcase
    client_secret: process.env.VUE_APP_OIDC_CLIENT_SECRET, // eslint-disable-line @typescript-eslint/camelcase
    redirect_uri: `${process.env.VUE_APP_BASE_URL}/signin-oidc`, // eslint-disable-line @typescript-eslint/camelcase
    response_type: 'code', // eslint-disable-line @typescript-eslint/camelcase

    id_token_signed_response_alg: 'RS256', // eslint-disable-line @typescript-eslint/camelcase
    post_logout_redirect_uri: process.env.VUE_APP_BASE_URL, // eslint-disable-line @typescript-eslint/camelcase

    silent_redirect_uri: `${process.env.VUE_APP_BASE_URL}/silent-renew`, // eslint-disable-line @typescript-eslint/camelcase
    automaticSilentRenew: true,

    loadUserInfo: true,
    scope: 'openid user email offline_access',
};

export interface UserProfile {
    address: string;
    privateKey: string;
    burnProofs: string[];
    memberships: string[];
}

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    userManager: UserManager = new UserManager(config);
    _user!: User;
    _profile: UserProfile | null = null;

    get address(): string {
        if (!this.privateKey) {
            return '';
        }
        const wallet = new ethers.Wallet(this.privateKey);
        if (ethers.utils.isAddress(wallet.address)) {
            return wallet.address;
        } else {
            return '';
        }
    }

    get user() {
        return this._user;
    }

    get privateKey() {
        if (!this.user) {
            return '';
        }
        return sessionStorage.getItem(`thx:wallet:user:${this.user.profile.sub}:key`);
    }

    get profile() {
        return this._profile;
    }

    @Mutation
    setUser(user: User) {
        this._user = user;
    }

    @Mutation
    setUserProfile(profile: UserProfile) {
        this._profile = profile;
    }

    @Action
    async getPrivateKey() {
        try {
            const torus = new TorusSdk({
                baseUrl: `${location.origin}/serviceworker`,
                enableLogging: true,
                network: 'testnet',
            });
            const torusKey: TorusKey = await torus.getTorusKey(
                'thx-email-password-testnet',
                this.user.profile.sub,
                { verifier_id: this.user.profile.sub }, // eslint-disable-line @typescript-eslint/camelcase
                this.user.access_token,
            );
            sessionStorage.setItem(`thx:wallet:user:${this.user.profile.sub}:key`, `0x${torusKey.privateKey}`);
        } catch (e) {
            console.error(e);
            return e;
        }
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
                throw Error('GET /account failed.');
            }

            this.context.commit('setUserProfile', r.data);

            return r.data;
        } catch (e) {
            return e;
        }
    }

    @Action
    async signup(data: SignupRequest) {
        try {
            const r = await axios({
                method: 'POST',
                url: '/signup',
                data,
            });

            if (r.status !== 201) {
                throw Error('POST /signup failed.');
            }

            return r.data.address;
        } catch (e) {
            return e;
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
        } catch (e) {
            return e;
        }
    }

    @Action
    async signinRedirect(token = '') {
        try {
            await this.userManager.clearStaleState();

            return await this.userManager.signinRedirect({
                extraQueryParams: {
                    authentication_token: token, // eslint-disable-line @typescript-eslint/camelcase
                },
            });
        } catch (e) {
            return e;
        }
    }

    @Action
    async signinRedirectCallback() {
        try {
            const user = await this.userManager.signinRedirectCallback();

            this.context.commit('setUser', user);

            return user;
        } catch (e) {
            return e;
        }
    }

    @Action
    async signoutRedirect() {
        try {
            await this.userManager.signoutRedirect({});

            this.context.commit('setUser', null);
        } catch (e) {
            return e;
        }
    }

    @Action
    async signout() {
        try {
            await this.userManager.removeUser();
            await this.userManager.clearStaleState();
            await axios({
                method: 'GET',
                url: config.authority + '/session/end',
            });
        } catch (e) {
            return e;
        }
    }

    @Action
    async signinSilent() {
        try {
            return await this.userManager.signinSilent();
        } catch (e) {
            return e;
        }
    }
}

export default AccountModule;
