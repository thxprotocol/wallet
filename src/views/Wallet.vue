<template>
    <div v-if="profile" class="d-flex align-items-center justify-content-center">
        <b-spinner variant="primary" class="m-auto" v-if="loading" />
        <template v-else>
            <strong v-if="!Object.values(erc20s).length" class="text-gray text-center">
                No tokens are visible for your account.
            </strong>
            <b-list-group v-else class="w-100 align-self-start">
                <base-list-group-item-token :erc20="erc20" :key="key" v-for="(erc20, key) in erc20s" />
                <base-list-group-item-nft :erc721="erc721" :key="key" v-for="(erc721, key) in erc721s" />
            </b-list-group>
        </template>
    </div>
</template>

<script lang="ts">
import BaseListGroupItemToken from '@/components/BaseListGroupItemToken.vue';
import BaseListGroupItemNft from '@/components/BaseListGroupItemNFT.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { ERC20 } from '@/store/modules/erc20';
import { ERC721 } from '@/store/modules/erc721';

@Component({
    components: {
        BaseListGroupItemToken,
        BaseListGroupItemNft,
    },
    computed: mapGetters({
        profile: 'account/profile',
        erc20s: 'erc20/all',
        erc721s: 'erc721/all',
    }),
})
export default class Wallet extends Vue {
    loading = true;
    erc20s!: { [id: string]: ERC20 };
    erc721s!: { [id: string]: ERC721 };
    profile!: UserProfile;

    mounted() {
        this.$store.dispatch('erc20/getAll').then(async () => {
            const promises = [];

            for (const id in this.erc20s) {
                promises.push(this.$store.dispatch('erc20/getToken', id));
            }

            await Promise.all(promises);

            this.loading = false;
        });

        this.$store.dispatch('erc721/getAll').then(async () => {
            const promises = [];

            for (const id in this.erc721s) {
                promises.push(this.$store.dispatch('erc721/get', id));
            }

            await Promise.all(promises);

            this.loading = false;
        });
    }
}
</script>
