import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { decryptString } from '@/utils/decrypt';
import { User, UserManager } from 'oidc-client';
import { ethers } from 'ethers';
import { encryptString } from '@/utils/encrypt';

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
    privateKey: string;
    address: string;
    assetPools: string[];
    burnProofs: string[];
}

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    userManager: UserManager = new UserManager(config);
    _user!: User;
    _profile: UserProfile | null = null;
    _password = '';
    _privateKey = '';

    get user() {
        return this._user;
    }

    get password() {
        return this._password;
    }

    get privateKey() {
        return this._privateKey;
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

    @Mutation
    setPassword({ pkey, pwd }: { pkey: string; pwd: string }) {
        try {
            this._privateKey = decryptString(pkey, pwd);
            this._password = pwd;
        } catch (e) {
            throw Error(e);
        }
    }

    @Action
    async setPrivateKey({ pkey, pwd }: { pkey: string; pwd: string }) {
        try {
            const account = new ethers.Wallet(pkey);

            if (ethers.utils.isAddress(account.address)) {
                const encryptedKey = encryptString(pkey, pwd);
                const r = await axios({
                    method: 'PATCH',
                    url: '/account',
                    data: {
                        address: account.address,
                        privateKey: encryptedKey,
                    },
                });

                if (r.status !== 200) {
                    throw Error('PATCH /account failed.');
                }

                this.context.commit('setUserProfile', r.data);
                this.context.commit('setPassword', pwd);
            }
        } catch (e) {
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
    async signinRedirect() {
        try {
            await this.userManager.clearStaleState();

            return await this.userManager.signinRedirect();
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
            return this.userManager.signinSilent();
        } catch (e) {
            return e;
        }
    }
}

export default AccountModule;
