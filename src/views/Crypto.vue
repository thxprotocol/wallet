<template>
    <div v-if="profile" class="d-flex align-items-center justify-content-center">
        <b-spinner variant="primary" class="m-auto" v-if="loading" />
        <template v-else>
            <strong v-if="!Object.values(erc20s).length" class="text-gray text-center">
                No tokens are visible for your account.
            </strong>
            <b-list-group v-else class="w-100 align-self-start">
                <base-list-group-item-token :erc20="erc20" :key="erc20.erc20Id" v-for="erc20 in erc20s" />
            </b-list-group>
        </template>
    </div>
</template>

<script lang="ts">
import BaseListGroupItemToken from '@/components/list-items/BaseListGroupItemToken.vue';
import BaseListGroupItemNft from '@/components/list-items/BaseListGroupItemNFT.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { IERC20s } from '@/store/modules/erc20';

@Component({
    components: {
        BaseListGroupItemToken,
        BaseListGroupItemNft,
    },
    computed: mapGetters({
        profile: 'account/profile',
        erc20s: 'erc20/all',
    }),
})
export default class Crypto extends Vue {
    loading = true;
    erc20s!: IERC20s;
    profile!: UserProfile;

    mounted() {
        this.$store.dispatch('erc20/list').then(() => {
            this.loading = false;
        });
    }
}
</script>
