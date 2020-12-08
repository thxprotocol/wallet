import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import axios from 'axios';
import { API_URL } from '@/utils/secrets';
import { Account } from './account';

interface TokenBalance {
    name: string;
    symbol: string;
    balance: { type: string; hex: string };
}

class Membership {
    title: string;
    address: string;
    owner: string;
    token: TokenBalance;
    isMember: string;
    isManager: string;
    balance: string;

    constructor(data: any) {
        this.title = data.title;
        this.address = data.address;
        this.owner = data.owner;
        this.token = data.token;
        this.isMember = data.isMember;
        this.isManager = data.isManager;
        this.balance = data.balance;
    }
}

@Module({ namespaced: true })
class MembershipModule extends VuexModule {
    _all: Membership[] = [];

    get all() {
        return this._all;
    }

    @Mutation
    add(membership: Membership) {
        if (this._all.indexOf(membership) === -1) {
            this._all.push(membership);
        }
    }

    @Action
    async init(account: Account) {
        for (const poolAddress of account.assetPools) {
            try {
                const r: any = await axios({
                    method: 'get',
                    url: API_URL + '/asset_pools/' + poolAddress,
                    headers: { AssetPool: poolAddress },
                });

                const x = await axios({
                    method: 'get',
                    url: API_URL + '/members/' + account.address,
                    headers: { AssetPool: poolAddress },
                });

                this.context.commit(
                    'add',
                    new Membership({
                        title: r.data.title,
                        address: r.data.address,
                        owner: r.data.owner,
                        token: r.data.token,
                        isMember: x.data.isMember,
                        isManager: x.data.isManager,
                        balance: x.data.token.balance.hex,
                    }),
                );
            } catch (e) {
                continue;
            }
        }
    }

    @Action
    async getMember(memberAddress: string, poolAddress: string) {
        return await axios({
            method: 'get',
            url: API_URL + '/members/' + memberAddress,
            headers: { AssetPool: poolAddress },
        });
    }
}

export default MembershipModule;
