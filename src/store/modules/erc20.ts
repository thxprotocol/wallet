import Vue from 'vue';
import Web3 from 'web3';
import Artifacts from '@/utils/artifacts';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { getERC20Contract, NetworkProvider, send } from '@/utils/network';
import { fromWei, toWei, toChecksumAddress } from 'web3-utils';
import { UserProfile } from './account';

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
    async get({ web3, poolToken }: { web3: Web3; poolToken: any }) {
        try {
            const contract = new web3.eth.Contract(Artifacts.IERC20.abi as any, toChecksumAddress(poolToken.address));
            const erc20 = new ERC20({
                address: poolToken.address,
                contract,
                name: poolToken.name,
                symbol: poolToken.symbol,
                totalSupply: poolToken.totalSupply,
                balance: poolToken.balance,
            });
            this.context.commit('set', erc20);
            return { erc20 };
        } catch (error) {
            return { error };
        }
    }

    @Action
    async balanceOf({ web3, address, profile }: { web3: Web3; address: string; profile: UserProfile }) {
        try {
            const abi: any = Artifacts.IERC20.abi;
            const contract = new web3.eth.Contract(abi, address);
            return { balance: fromWei(await contract.methods.balanceOf(profile.address).call()) };
        } catch (error) {
            return { error };
        }
    }

    @Action
    async updateBalance({ web3, address, profile }: { web3: Web3; address: string; profile: UserProfile }) {
        try {
            const erc20 = this.context.getters['all'][address];
            const abi: any = Artifacts.IERC20.abi;
            const contract = new web3.eth.Contract(abi, address);

            erc20.balance = fromWei(await contract.methods.balanceOf(profile.address).call());

            this.context.commit('set', erc20);
        } catch (error) {
            console.log(error);
        }
    }

    @Action
    async allowance({
        web3,
        tokenAddress,
        owner,
        spender,
        privateKey,
    }: {
        web3: Web3;
        tokenAddress: string;
        owner: string;
        spender: string;
        privateKey: string;
    }) {
        try {
            const contract: any = getERC20Contract(web3, tokenAddress);
            const from = web3.eth.accounts.privateKeyToAccount(privateKey).address;
            const wei = await contract.methods.allowance(owner, spender).call({ from });

            return fromWei(wei, 'ether');
        } catch (error) {
            throw new Error(String(error));
        }
    }

    @Action
    async approve({
        web3,
        tokenAddress,
        to,
        amount,
        privateKey,
    }: {
        web3: Web3;
        tokenAddress: string;
        to: string;
        amount: string;
        privateKey: string;
    }) {
        try {
            const contract: any = getERC20Contract(web3, tokenAddress);
            const wei = toWei(amount);
            const tx = await send(web3, contract, contract.methods.approve(to, wei), privateKey);

            return { tx };
        } catch (error) {
            return {
                error,
            };
        }
    }

    @Action
    async transfer({
        web3,
        tokenAddress,
        to,
        amount,
        privateKey,
    }: {
        web3: Web3;
        tokenAddress: string;
        to: string;
        amount: string;
        privateKey: string;
    }) {
        try {
            const contract: any = getERC20Contract(web3, tokenAddress);
            const wei = toWei(amount);
            const tx = await send(web3, contract, contract.methods.transfer(to, wei), privateKey);

            return { tx };
        } catch (error) {
            return { error };
        }
    }
}

export default ERC20Module;
