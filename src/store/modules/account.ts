import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { config } from '../../network';

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
        this._account.address = config.user.address;
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
        try {
            const r = await axios.get('/account');

            this.context.commit('set', r.data);
            this.context.commit('authenticate', true);

            return r;
        } catch (err) {
            this.context.commit('authenticate', false);
        }
    }

    @Action
    logout() {
        return axios
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

    @Action
    async updateProfile(data: Profile) {
        await axios.post('/account/profile', data);

        return await this.context.dispatch('init');
    }
}

export default AccountModule;
