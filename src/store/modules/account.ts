import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosError, AxiosResponse } from 'axios';

axios.defaults.withCredentials = true;

interface AuthObject {
    email: string;
    password: string;
}

class Account {
    createdAt = 0;
    password = '';
    profile = {};
    email = '';
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
    update({ createdAt, email, password, profile }: Account) {
        this._account.createdAt = createdAt;
        this._account.email = email;
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
    init() {
        return axios
            .get('http://localhost:8088/v1/account')
            .then((r: AxiosResponse) => {
                this.context.commit('update', r.data);
                this.context.commit('authenticate', true);
            })
            .catch((e: AxiosError) => {
                this.context.commit('authenticate', false);
            });
    }

    @Action
    logout() {
        axios
            .get('http://localhost:8088/v1/logout')
            .then(() => {
                this.context.commit('reset');
            })
            .catch((e: AxiosError) => {
                this.context.commit('reset');
            });
    }

    @Action
    login({ email, password }: AuthObject) {
        return axios.post('http://localhost:8088/v1/login', { email, password });
    }
}

export default AccountModule;
