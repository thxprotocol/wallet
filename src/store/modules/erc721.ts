import Vue from 'vue';
import { default as ERC721Abi } from '@thxnetwork/artifacts/dist/exports/abis/NonFungibleToken.json';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { fromWei } from 'web3-utils';
import axios from 'axios';

export interface ERC721 {
    _id: string;
    address: string;
    contract: Contract;
    name: string;
    symbol: string;
    balance: string;
    totalSupply: string;
    logoURI: string;
}

@Module({ namespaced: true })
class ERC721Module extends VuexModule {
    _all: { [address: string]: ERC721 } = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(erc20: ERC721) {
        Vue.set(this._all, erc20.address, erc20);
    }

    @Action({ rawError: true })
    async get(id: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc721/' + id,
        });
        const web3 = this.context.rootGetters['network/all'][data.network];
        const from = this.context.rootGetters['account/profile'].address;
        const contract = new web3.eth.Contract(ERC721Abi as any, data.address, { from });
        const erc721 = {
            _id: id,
            address: data.address,
            name: data.name,
            symbol: data.symbol,
            contract,
            logoURI: `https://avatars.dicebear.com/api/identicon/${data._id}.svg`,
        };

        this.context.commit('set', erc721);

        return { erc721 };
    }

    @Action({ rawError: true })
    async getMetadata(erc721: ERC721) {
        debugger;
        const { data } = await axios({
            method: 'GET',
            url: '/erc721/' + erc721._id + '/metadata/',
        });
        debugger;
        const erc721metadata = {
            address: data.address,
            name: data.name,
            symbol: data.symbol,
            metadata: data.metadata,
            logoURI: `https://avatars.dicebear.com/api/identicon/${data._id}.svg`,
        };

        this.context.commit('setMetadata', erc721);

        return { erc721metadata };
    }
}

export default ERC721Module;
