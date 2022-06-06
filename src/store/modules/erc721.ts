import Vue from 'vue';
import { default as ERC721Abi } from '@thxnetwork/artifacts/dist/exports/abis/NonFungibleToken.json';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';

export interface ERC721 {
    _id: string;
    contract: Contract;
    erc721: {
        address: string;
        name: string;
        symbol: string;
        totalSupply: string;
        logoURI: string;
    };
    balance: string;
}

@Module({ namespaced: true })
class ERC721Module extends VuexModule {
    _all: { [erc721Id: string]: ERC721 } = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(erc721: ERC721) {
        Vue.set(this._all, erc721._id, erc721);
    }

    @Mutation
    setBalance(payload: { erc721: ERC721; balance: string }) {
        Vue.set(this._all[payload.erc721._id], 'balance', payload.balance);
    }

    @Action({ rawError: true })
    async balanceOf(erc721: ERC721) {
        const profile = this.context.rootGetters['account/profile'];
        const balance = await erc721.contract.methods.balanceOf(profile.address).call();

        this.context.commit('setBalance', { erc721, balance });
    }

    @Action({ rawError: true })
    async getAll() {
        const r = await axios({
            method: 'GET',
            url: '/erc721/token',
        });

        r.data.forEach((_id: string) => {
            this.context.commit('set', { _id });
        });
    }

    @Action({ rawError: true })
    async get(id: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc721/token/' + id,
        });
        const web3 = this.context.rootGetters['network/all'][data.erc721.network];
        const from = this.context.rootGetters['account/profile'].address;
        const contract = new web3.eth.Contract(ERC721Abi as any, data.erc721.address, { from });
        const erc721 = {
            ...data,
            contract,
            blockExplorerURL: `https://polygonscan.com/address/${data.erc721.address}`,
            logoURI: `https://avatars.dicebear.com/api/identicon/${data.erc721._id}.svg`,
        };

        this.context.commit('set', erc721);
        this.context.dispatch('balanceOf', erc721);
    }

    // @Action({ rawError: true })
    // async getMetadata(erc721: ERC721) {
    //     const { data } = await axios({
    //         method: 'GET',
    //         url: '/erc721/' + erc721._id + '/metadata/',
    //     });
    //     const erc721metadata = {
    //         address: data.address,
    //         name: data.name,
    //         symbol: data.symbol,
    //         metadata: data.metadata,
    //         logoURI: `https://avatars.dicebear.com/api/identicon/${data._id}.svg`,
    //     };

    //     this.context.commit('setMetadata', erc721);

    //     return { erc721metadata };
    // }
}

export default ERC721Module;
