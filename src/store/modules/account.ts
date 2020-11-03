import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { account } from '@/utils/network';

interface AuthObject {
    email: string;
    password: string;
}

export class Account {
    address = '';
    email = '';
    firstName = '';
    lastName = '';
    assetPools: string[] = [];
    burnProofs: string[] = [];
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
    set({ email, firstName, lastName, assetPools, burnProofs }: Account) {
        this._account.address = account.address;
        this._account.email = email;
        this._account.firstName = firstName;
        this._account.lastName = lastName;
        this._account.assetPools = assetPools;
        this._account.burnProofs = burnProofs;
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
                    debugger;
                    resolve(r);
                })
                .catch((err: AxiosError) => {
                    this.context.commit('reset');
                    debugger;
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
    async updateProfile(data: Account) {
        return new Promise((resolve, reject) => {
            axios
                .patch('/account', data)
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
