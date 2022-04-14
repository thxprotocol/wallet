import Vue from 'vue';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { NetworkProvider, send } from '@/utils/network';
import { fromWei, toWei, toChecksumAddress } from 'web3-utils';
import axios from 'axios';

export interface ERC20 {
    address: string;
    contract: Contract;
    name: string;
    symbol: string;
    balance: string;
    totalSupply: string;
    logoURI: string;
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
    async get(id: string) {
        try {
            const { data } = await axios({
                method: 'GET',
                url: '/erc20/' + id,
            });
            const web3 = this.context.rootGetters['network/all'][data.network];
            const from = this.context.rootGetters['account/profile'].address;
            const contract = new web3.eth.Contract(ERC20Abi as any, data.address, { from });
            const totalSupply = Number(fromWei(await contract.methods.totalSupply().call()));
            const erc20 = {
                address: data.address,
                name: data.name,
                symbol: data.symbol,
                contract,
                totalSupply,
                logoURI: `https://avatars.dicebear.com/api/identicon/${data._id}.svg`,
            };

            this.context.commit('set', erc20);
            return { erc20 };
        } catch (error) {
            return { error };
        }
    }

    @Action({ rawError: true })
    async balanceOf(erc20: ERC20) {
        const profile = this.context.rootGetters['account/profile'];
        const wei = await erc20.contract.methods.balanceOf(profile.address).call();
        return fromWei(wei);
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
