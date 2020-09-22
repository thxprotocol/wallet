import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { config } from '../../network';

interface AuthObject {
    email: string;
    password: string;
}

class Account {
    createdAt = 0;
    password = '';
    profile = {};
    email = '';
    address = '';
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
        this._account.address = config.user.address;
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
            .get('/account')
            .then((r: AxiosResponse) => {
                this.context.commit('update', r.data);
                this.context.commit('authenticate', true);
            })
            .catch((e: AxiosError) => {
                console.error(e);
                this.context.commit('authenticate', false);
            });
    }

    @Action
    logout() {
        axios
            .get('/logout')
            .then(() => {
                this.context.commit('reset');
            })
            .catch((e: AxiosError) => {
                console.error(e);
                this.context.commit('reset');
            });
    }

    @Action
    login({ email, password }: AuthObject) {
        return axios.post('/login', { email, password });
    }
}

export default AccountModule;
