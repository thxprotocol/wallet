import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosError, AxiosResponse } from 'axios';
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
    set({ address, email, firstName, lastName, assetPools, burnProofs }: Account) {
        this._account.address = address;
        this._account.email = email;
        this._account.firstName = firstName;
        this._account.lastName = lastName;
        this._account.assetPools = assetPools;
        this._account.burnProofs = burnProofs;
        this._account.privateKey = localStorage.getItem('thx:wallet:privatekey') || '';
    }

    @Mutation
    updatePrivateKey(pKey: string) {
        this._account.privateKey = pKey;
        localStorage.setItem('thx:wallet:privatekey', pKey);
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

    @Mutation
    decryptPrivateKey({ encrypted, password }: { encrypted: string; password: string }) {
        const decrypted = decryptString(encrypted, password);
        localStorage.setItem('thx:wallet:privatekey', decrypted);
    }

    @Action
    async init(password = '') {
        return new Promise(resolve => {
            axios
                .get('/account')
                .then((r: AxiosResponse) => {
                    if (r.data.privateKey && password.length) {
                        this.context.commit('decryptPrivateKey', { encrypted: r.data.privateKey, password });
                    }
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
    async signup(payload: SignupRequest) {
        debugger;
        return new Promise((resolve, reject) => {
            axios
                .post('/signup', payload)
                .then((r: AxiosResponse) => {
                    debugger;
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
