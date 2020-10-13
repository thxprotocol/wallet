import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ADDRESS } from '@/utils/secrets';

interface AuthObject {
    email: string;
    password: string;
}

export class Profile {
    firstName = '';
    lastName = '';
    gender = '';
    location = '';
    picture = '';
    assetPools: string[] = [];
    burnProof: string[] = [];
}

export class Account {
    address = '';
    email = '';
    createdAt = 0;
    password = '';
    profile = new Profile();
}

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    _account: Account = new Account();
    _isAuthenticated = false;

    get isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    get account(): Account {
        return this._account;
    }

    @Mutation
    set({ createdAt, email, password, profile }: Account) {
        this._account.address = ADDRESS;
        this._account.email = email;
        this._account.createdAt = createdAt;
        this._account.password = password;
        this._account.profile = profile;
    }

    @Mutation
    authenticate(state: boolean) {
        this._isAuthenticated = state;
    }

    @Mutation
    reset() {
        this._account = new Account();
        this._isAuthenticated = false;
    }

    @Action
    async init() {
        return new Promise(resolve => {
            axios
                .get('/account')
                .then((r: AxiosResponse) => {
                    this.context.commit('set', r.data);
                    this.context.commit('authenticate', true);
                    resolve({ auth: true });
                })
                .catch(() => {
                    this.context.commit('authenticate', false);
                    resolve({ auth: false });
                });
        });
    }

    @Action
    async logout() {
        return new Promise((resolve, reject) => {
            axios
                .get('/logout')
                .then((r: AxiosResponse) => {
                    this.context.commit('reset');
                    resolve(r);
                })
                .catch((err: AxiosError) => {
                    this.context.commit('reset');
                    reject(err);
                });
        });
    }

    @Action
    async login({ email, password }: AuthObject) {
        return new Promise((resolve, reject) => {
            axios
                .post('/login', { email, password })
                .then((r: AxiosResponse) => {
                    resolve(r);
                })
                .catch((err: AxiosError) => {
                    reject(err);
                });
        });
    }

    @Action
    async updateProfile(data: Profile) {
        return new Promise((resolve, reject) => {
            axios
                .post('/account/profile', data)
                .then((r: AxiosResponse) => {
                    this.context.dispatch('init');
                    resolve(r);
                })
                .catch((err: AxiosError) => {
                    reject(err);
                });
        });
    }
}

export default AccountModule;
