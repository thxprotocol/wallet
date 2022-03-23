import Vue from 'vue';
import Web3 from 'web3';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { NetworkProvider } from '@/utils/network';
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

    @Action
    async get({ web3, membership }: { web3: Web3; membership: Membership }) {
        try {
            const contract = new web3.eth.Contract(
                // Get latest (hardhat) config for abi of TokenLimitedSupply which is similar to ERC20
                ERC20Abi as any,
                toChecksumAddress(membership.token.address),
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

    @Action
    async balanceOf({ token, profile }: { token: ERC20; profile: UserProfile }) {
        try {
            const wei = await token.contract.methods.balanceOf(profile.address).call();

            return { balance: fromWei(wei) };
        } catch (error) {
            return { error };
        }
    }

    @Action
    async allowance({ token, owner, spender }: { token: ERC20; owner: string; spender: string }) {
        try {
            const wei = await token.contract.methods.allowance(owner, spender).call();

            return { allowance: fromWei(wei, 'ether') };
        } catch (error) {
            throw { error };
        }
    }

    @Action
    async approve({ token, to, amount }: { token: ERC20; to: string; amount: string }) {
        try {
            console.log('approved owner', token.contract.defaultAccount);
            console.log('approved spender', to);

            const fn = token.contract.methods.approve(to, amount);
            const gas = await fn.estimateGas();
            const tx = await fn.send({ gas, from: token.contract.defaultAccount });

            return { tx };
        } catch (error) {
            return { error };
        }
    }

    @Action
    async transfer({ token, to, amount }: { token: ERC20; to: string; amount: string }) {
        try {
            const wei = toWei(amount);
            const fn = token.contract.methods.transfer(to, wei);
            const gas = await fn.estimateGas();
            const tx = await fn.send({ gas, from: token.contract.defaultAccount });

            return { tx };
        } catch (error) {
            return { error };
        }
    }
}

export default ERC20Module;
