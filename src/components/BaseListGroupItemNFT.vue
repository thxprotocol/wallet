<template>
    <b-list-group-item v-if="membership && token">
        <div class="d-flex justify-content-between align-items-center" v-b-toggle="`collapse-${membership.id}`">
            <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="token.name">
                <base-identicon :rounded="true" variant="dark" :size="30" :uri="token.logoURI" class="mr-2" />
                <strong class="mr-2">{{ token.symbol }}</strong>
                <b-badge variant="primary">NFT</b-badge>
            </div>
            <div class="h3 mr-3 m-0">
                {{ balance }}
            </div>
        </div>
        <b-collapse :id="`collapse-${membership.id}`" class="mt-2">
            <hr />
            <b-card bg-variant="light" class="small mb-2" :key="token._id" v-for="token of membership.tokens">
                <b-row>
                    <b-col md="12">
                        <strong>
                            <b-badge variant="dark">#{{ token.tokenId }}</b-badge>
                            {{ token.metadata.title }}
                        </strong>
                        <p class="small">{{ token.metadata.description }}</p>
                    </b-col>
                    <b-col md="4" :key="metadata._id" v-for="metadata of token.metadata.attributes">
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
    }),
})
export default class BaseListGroupItemNFT extends Vue {
    busy = true;
    balance = 0;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;

    token: ERC721 | null = null;

    @Prop() membership!: Membership;

    async mounted() {
        this.$store.dispatch('erc721/get', this.membership.erc721).then(async ({ erc721 }: { erc721: ERC721 }) => {
            this.token = erc721;
            this.balance = await erc721.contract.methods.balanceOf(this.profile.address).call();
        });
    }
}
</script>
