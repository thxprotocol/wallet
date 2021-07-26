import Web3 from 'web3';
import Artifacts from '@/utils/artifacts';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { getERC20Contract, NetworkProvider, send } from '@/utils/network';
import Contract from 'web3/eth/contract';
import { fromWei, toWei } from 'web3-utils';
import { AssetPool } from './assetPools';
import { UserProfile } from './account';
import Vue from 'vue';

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
    setERC20(erc20: ERC20) {
        Vue.set(this._all, erc20.address, erc20);
    }

    @Action
    async get({ web3, address, profile }: { web3: Web3; address: string; profile: UserProfile }) {
        const abi: any = Artifacts.ERC20.abi;
        const contract = new web3.eth.Contract(abi, address);

        this.context.commit(
            'setERC20',
            new ERC20({
                address,
                contract,
                name: await contract.methods.name().call(),
                symbol: await contract.methods.symbol().call(),
                balance: fromWei(await contract.methods.balanceOf(profile.address).call()),
                totalSupply: await contract.methods.totalSupply().call(),
            }),
        );
    }

    @Action
    async approve({
        web3,
        assetPool,
        amount,
        privateKey,
    }: {
        web3: Web3;
        assetPool: AssetPool;
        amount: string;
        privateKey: string;
    }) {
        try {
            const contract: any = getERC20Contract(web3, assetPool.poolToken.address);
            const wei = toWei(amount);

            return await send(web3, contract, contract.methods.approve(assetPool.address, wei), privateKey);
        } catch (e) {
            return {
                error: e.toString(),
            };
        }
    }
}

export default ERC20Module;
