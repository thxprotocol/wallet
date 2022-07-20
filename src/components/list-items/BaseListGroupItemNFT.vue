<template>
    <b-list-group-item v-if="erc721">
        <div class="d-flex justify-content-between align-items-center" v-b-toggle="`collapse-${erc721._id}`">
            <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="erc721.name">
                <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc721.logoURI" class="mr-2" />
                <strong class="mr-2">{{ erc721.symbol }}</strong>
                <b-badge variant="primary">NFT</b-badge>
            </div>
            <div class="h3 mr-3 m-0">
                {{ erc721.balance }}
            </div>
        </div>
        <b-collapse :id="`collapse-${erc721._id}`" class="mt-2">
            <hr />
            <base-card-erc-721-token :erc721="erc721" :token="token" :key="token._id" v-for="token of tokens" />
        </b-collapse>
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { ERC721 } from '@/store/modules/erc721';
import { TNetworks } from '@/store/modules/network';
import BaseModalTransferTokens from '@/components/modals/ModalTransferTokens.vue';
import BaseCardErc721Token from '@/components/BaseCardERC721Token.vue';
import BaseIdenticon from '../BaseIdenticon.vue';

@Component({
    components: {
        BaseCardErc721Token,
        BaseModalTransferTokens,
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        erc721Tokens: 'erc721/tokens',
    }),
})
export default class BaseListGroupItemNFT extends Vue {
    busy = true;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    erc721Tokens!: { [id: string]: any };

    get tokens() {
        if (!this.erc721Tokens[this.erc721._id]) return [];
        return this.erc721Tokens[this.erc721._id];
    }

    @Prop() erc721!: ERC721;
}
</script>
