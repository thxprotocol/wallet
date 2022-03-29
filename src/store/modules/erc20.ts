import Vue from 'vue';
import Web3 from 'web3';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { NetworkProvider, send } from '@/utils/network';
import { fromWei, toWei, toChecksumAddress } from 'web3-utils';
import { UserProfile } from './account';
import { Membership } from './memberships';

export interface ERC20Token {
    network: NetworkProvider;
    address: string;
}

export class ERC20 {
    address!: string;
    contract: Contract;
    name!: string;
    symbol!: string;
    balance!: string;
    totalSupply!: string;

    constructor(data: any) {
        this.address = data.address;
        this.contract = data.contract;
        this.name = data.name;
        this.symbol = data.symbol;
        this.balance = data.balance;
        this.totalSupply = data.totalSupply;
    }
}

@Module({ namespaced: true })
class ERC20Module extends VuexModule {
    _all: { [address: string]: ERC20 } = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(erc20: ERC20) {
        Vue.set(this._all, erc20.address, erc20);
    }

    @Action({ rawError: true })
    async get({ web3, membership }: { web3: Web3; membership: Membership }) {
        try {
            const from = toChecksumAddress(this.context.rootGetters['account/profile'].address);
            const contract = new web3.eth.Contract(
                // Get latest (hardhat) config for abi of TokenLimitedSupply which is similar to ERC20
                ERC20Abi as any,
                toChecksumAddress(membership.token.address),
                { from },
            );
            const erc20 = new ERC20({
                address: membership.token.address,
                contract,
                name: membership.token.name,
                symbol: membership.token.symbol,
                totalSupply: membership.token.totalSupply,
                balance: membership.token.balance,
            });
            this.context.commit('set', erc20);

            return { erc20 };
        } catch (error) {
            return { error };
        }
    }

    @Action({ rawError: true })
    async balanceOf({ token, profile }: { token: ERC20; profile: UserProfile }) {
        const wei = await token.contract.methods.balanceOf(profile.address).call();
        return { balance: fromWei(wei) };
    }

    @Action({ rawError: true })
    async allowance({ token, owner, spender }: { token: ERC20; owner: string; spender: string }) {
        const wei = await token.contract.methods.allowance(owner, spender).call({ from: owner });
        return { allowance: fromWei(wei, 'ether') };
    }

    @Action({ rawError: true })
    async approve({
        token,
        network,
        to,
        amount,
    }: {
        token: ERC20;
        network: NetworkProvider;
        to: string;
        amount: string;
    }) {
        const web3 = this.context.rootGetters['network/all'][network];
        const privateKey = this.context.rootGetters['account/privateKey'];
        const tx = await send(web3, token.address, token.contract.methods.approve(to, amount), privateKey);

        return { tx };
    }

    @Action({ rawError: true })
    async transfer({
        token,
        network,
        to,
        amount,
    }: {
        token: ERC20;
        network: NetworkProvider;
        to: string;
        amount: string;
    }) {
        const wei = toWei(amount);
        const web3 = this.context.rootGetters['network/all'][network];
        const privateKey = this.context.rootGetters['account/privateKey'];
        const tx = await send(
            web3,
            token.address,
            token.contract.methods.transfer(toChecksumAddress(to), wei),
            privateKey,
        );

        return { tx };
    }
}

export default ERC20Module;
