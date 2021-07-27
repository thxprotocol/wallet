import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { User, UserManager } from 'oidc-client';
import Web3 from 'web3';
import { config } from '@/utils/oidc';
import { getPrivateKey } from '@/utils/torus';
import { isAddress } from 'web3-utils';
import { ERC20Token } from './erc20';
import { isPrivateKey } from '@/utils/network';

const web3 = new Web3();

export interface UserProfile {
    address: string;
    privateKey: string;
    burnProofs: string[];
    memberships: string[];
    erc20: ERC20Token[];
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
    async updateAccountAddress(address: string) {
        try {
            const r = await axios({
                method: 'PATCH',
                url: '/account',
                data: { address },
            });

            if (r.status !== 200) {
                throw new Error('PATCH /account failed.');
            }

            this.context.commit('setUserProfile', r.data);
        } catch (e) {
            return new Error('Unable to update account with address.');
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
                return { error: Error('GET /account failed.') };
            }

            this.context.commit('setUserProfile', r.data);

            try {
                let privateKey = this.context.getters.privateKey;

                if (!isPrivateKey(privateKey)) {
                    const result = await getPrivateKey(this.user);

                    if (result && !result.error) {
                        privateKey = result.privateKey;
                    } else {
                        return new Error('Unable to get private key from Torus verifier.');
                    }
                }

                const account = web3.eth.accounts.privateKeyToAccount(privateKey);

                if (isAddress(account.address)) {
                    this.context.commit('setPrivateKey', { sub: this.user.profile.sub, privateKey });

                    if (r.data.address !== account.address) {
                        await this.context.dispatch('updateAccountAddress', account.address);
                    }
                } else {
                    return new Error('Not a valid address.');
                }
            } catch (e) {
                console.log(e);
                return new Error('Unable to get private key.');
            }
        } catch (e) {
            console.log(e);
            return { error: new Error('Unable to get profile.') };
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
            return { error: e };
        }
    }

    @Action
    async signinRedirect(payload: { token: string; key: string }) {
        try {
            await this.userManager.clearStaleState();

            return await this.userManager.signinRedirect({
                extraQueryParams: {
                    authentication_token: payload && payload.token ? payload.token.replace(/\s/g, '+') : '', // eslint-disable-line @typescript-eslint/camelcase
                    secure_key: payload && payload.key ? payload.key.replace(/\s/g, '+') : '', // eslint-disable-line @typescript-eslint/camelcase
                },
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
            return { error: e };
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
