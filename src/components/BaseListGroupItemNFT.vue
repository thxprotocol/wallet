<template>
    <b-list-group-item v-if="membership && erc721">
        <div class="d-flex justify-content-between align-items-center" v-b-toggle="`collapse-${membership.id}`">
            <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="erc721.name">
                <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc721.logoURI" class="mr-2" />
                <strong class="mr-2">{{ erc721.symbol }}</strong>
                <b-badge variant="primary">NFT</b-badge>
            </div>
            <div class="h3 mr-3 m-0">
                {{ erc721.balance }}
            </div>
        </div>
        <b-collapse :id="`collapse-${membership.id}`" class="mt-2">
            <hr />
            <b-card bg-variant="light" class="small mb-2" :key="erc721._id" v-for="erc721 of membership.tokens">
                <b-row>
                    <b-col md="12">
                        <strong>
                            <b-badge variant="dark">#{{ erc721.tokenId }}</b-badge>
                            {{ erc721.metadata.title }}
                        </strong>
                        <p class="small">{{ erc721.metadata.description }}</p>
                    </b-col>
                    <b-col md="4" :key="metadata._id" v-for="metadata of erc721.metadata.attributes">
                        <b-form-group :label="metadata.key" label-class="text-muted pb-0" class="mb-md-0">
                            {{ metadata.value }}
                        </b-form-group>
                    </b-col>
                </b-row>
            </b-card>
        </b-collapse>
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { ERC721 } from '@/store/modules/erc721';
import BaseModalTransferTokens from '@/components/modals/ModalTransferTokens.vue';
import { TNetworks } from '@/store/modules/network';
import { Membership } from '@/store/modules/memberships';
import BaseIdenticon from './BaseIdenticon.vue';

@Component({
    components: {
        BaseModalTransferTokens,
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        erc721s: 'erc721/all',
    }),
})
export default class BaseListGroupItemNFT extends Vue {
    busy = true;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    erc721s!: { [id: string]: ERC721 };

    get erc721() {
        return this.erc721s[this.membership.erc721];
    }

    @Prop() membership!: Membership;

    mounted() {
        this.$store.dispatch('erc721/get', this.membership.erc721);
    }
}
</script>
