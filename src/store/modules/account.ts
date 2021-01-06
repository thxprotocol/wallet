import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { decryptString } from '@/utils/decrypt';
import { User, UserManager } from 'oidc-client';

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
    client_id: 'i-ZXH7aQAySfdElxCBemv', // eslint-disable-line @typescript-eslint/camelcase
    client_secret: '4_DsySsW8EiNNwrDYA4LTsGvDgn7dsoiJy4ZdlGRxaIesbfkZM5f0tGZyk6hRJbeyDnNdCWweDjcfjZ47tB4tA', // eslint-disable-line @typescript-eslint/camelcase
    redirect_uri: `${process.env.VUE_APP_BASE_URL}/signin-oidc`, // eslint-disable-line @typescript-eslint/camelcase
    response_type: 'code', // eslint-disable-line @typescript-eslint/camelcase

    id_token_signed_response_alg: 'RS256', // eslint-disable-line @typescript-eslint/camelcase
    post_logout_redirect_uri: process.env.VUE_APP_BASE_URL, // eslint-disable-line @typescript-eslint/camelcase

    silent_redirect_uri: `${process.env.VUE_APP_BASE_URL}/silent-renew`, // eslint-disable-line @typescript-eslint/camelcase
    automaticSilentRenew: true,

    loadUserInfo: true,
    scope: 'openid profile email address privateKey admin',
};

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    userManager: UserManager = new UserManager(config);
    _user!: User | null;

    get user() {
        return this._user;
    }

    @Mutation
    setUser(user: User) {
        this._user = user;
    }

    @Mutation
    updatePrivateKey(pKey: string) {
        localStorage.setItem('thx:wallet:privatekey', pKey);
    }

    @Mutation
    decryptPrivateKey({ encrypted, password }: { encrypted: string; password: string }) {
        const decrypted = decryptString(encrypted, password);
        localStorage.setItem('thx:wallet:privatekey', decrypted);
    }

    // @Action
    // async init(password = '') {
    //     return new Promise(resolve => {
    //         axios
    //             .get('/account')
    //             .then((r: AxiosResponse) => {
    //                 if (r.data.privateKey && password.length) {
    //                     this.context.commit('decryptPrivateKey', { encrypted: r.data.privateKey, password });
    //                 }
    //                 this.context.commit('set', r.data);
    //                 this.context.commit('authenticate', true);
    //                 resolve({ auth: true });
    //             })
    //             .catch(() => {
    //                 this.context.commit('authenticate', false);
    //                 resolve({ auth: false });
    //             });
    //     });
    // }

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
    async signinSilent() {
        try {
            return this.userManager.signinSilent();
        } catch (e) {
            return e;
        }
    }

    @Action
    async signup(payload: SignupRequest) {
        return new Promise((resolve, reject) => {
            axios
                .post('/signup', payload)
                .then((r: AxiosResponse) => {
                    resolve(r);
                })
                .catch((err: AxiosError) => {
                    reject(err);
                });
        });
    }

    @Action
    async update(data: Account) {
        return new Promise((resolve, reject) => {
            axios({
                url: '/account',
                method: 'patch',
                data,
            })
                .then((r: AxiosResponse) => {
                    resolve(r);
                })
                .catch((err: AxiosError) => {
                    reject(err);
                });
        });
    }
}

export default AccountModule;
