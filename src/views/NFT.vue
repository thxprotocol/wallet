<template>
    <div v-if="profile" class="d-flex align-items-center justify-content-center">
        <b-spinner variant="primary" class="m-auto" v-if="loading" />
        <template v-else>
            <strong v-if="!Object.values(erc721s).length" class="text-gray text-center">
                No tokens are visible for your account.
            </strong>
            <b-list-group v-else class="w-100 align-self-start">
                <base-list-group-item-nft :erc721="erc721" :key="key" v-for="(erc721, key) in erc721s" />
            </b-list-group>
        </template>
    </div>
</template>

<script lang="ts">
import BaseListGroupItemNft from '@/components/list-items/BaseListGroupItemNFT.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { ERC721 } from '@/store/modules/erc721';

@Component({
    components: {
        BaseListGroupItemNft,
    },
    computed: mapGetters({
        profile: 'account/profile',
        erc721s: 'erc721/all',
    }),
})
export default class NFTView extends Vue {
    loading = true;
    profile!: UserProfile;
    erc721s!: { [address: string]: ERC721 };

    mounted() {
        this.$store.dispatch('erc721/list').then(async () => {
            this.loading = false;
        });
    }
}
</script>
