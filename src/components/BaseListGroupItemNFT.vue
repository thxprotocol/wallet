<template>
    <b-list-group-item v-if="erc721.erc721">
        <div class="d-flex justify-content-between align-items-center" v-b-toggle="`collapse-${erc721._id}`">
            <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="erc721.erc721.name">
                <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc721.logoURI" class="mr-2" />
                <strong class="mr-2">{{ erc721.erc721.name }}</strong>
                <b-badge variant="primary" class="mr-1">NFT</b-badge>
            </div>
            <div class="h3 mr-3 m-0">
                {{ erc721.erc721.symbol }}
                #{{ erc721.tokenId }}
            </div>
        </div>
        <b-collapse :id="`collapse-${erc721._id}`" class="mt-2">
            <hr />
            <b-card bg-variant="light" class="small mb-2">
                <b-row>
                    <b-col md="12">
                        <strong>
                            {{ erc721.metadata.title }}
                        </strong>
                        <p class="small">{{ erc721.metadata.description }}</p>
                    </b-col>

                    <b-col md="4" :key="key" v-for="(metadata, key) of erc721.metadata.attributes">
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
import { ERC721 } from '@/store/modules/erc721';
import BaseModalTransferTokens from '@/components/modals/ModalTransferTokens.vue';
import BaseIdenticon from './BaseIdenticon.vue';

@Component({
    components: {
        BaseModalTransferTokens,
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseListGroupItemNFT extends Vue {
    @Prop() erc721!: ERC721;
}
</script>
