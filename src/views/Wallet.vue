<template>
    <div v-if="profile" class="d-flex align-items-center justify-content-center">
        <b-spinner variant="primary" class="m-auto" v-if="loading" />
        <template v-else>
            <strong v-if="!uniqueMembershipTokens.length" class="text-gray text-center">
                No tokens are visible for your account.
            </strong>
            <b-list-group v-else class="w-100 align-self-start">
                <component
                    :is="membership.erc721Id ? 'BaseListGroupItemNft' : 'BaseListGroupItemToken'"
                    :membership="membership"
                    :key="key"
                    v-for="(membership, key) in uniqueMembershipTokens"
                />
            </b-list-group>
        </template>
    </div>
</template>

<script lang="ts">
import BaseListGroupItemToken from '@/components/list-items/BaseListGroupItemToken.vue';
import BaseListGroupItemNft from '@/components/list-items/BaseListGroupItemNFT.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IMemberships, Membership } from '@/store/modules/memberships';
import { UserProfile } from '@/store/modules/account';

@Component({
    components: {
        BaseListGroupItemToken,
        BaseListGroupItemNft,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
    }),
})
export default class Wallet extends Vue {
    loading = true;
    memberships!: IMemberships;
    profile!: UserProfile;
    uniqueMembershipTokens: Membership[] = [];

    mounted() {
        this.$store.dispatch('memberships/getAll').then(async () => {
            console.log('this.memberships', this.memberships);
            console.log('Object.keys(this.memberships)', Object.keys(this.memberships));
            const promises = Object.keys(this.memberships).map((id: string) => {
                if (id) {
                    console.log('ID', id);
                    return this.$store.dispatch('memberships/get', id);
                }
            });

            await Promise.all(promises);

            console.log('SONO QUI MOUNTED 6', this.memberships);
            for (const id in this.memberships) {
                const erc20Index = this.uniqueMembershipTokens.findIndex(
                    (membership: Membership) => this.memberships[id].erc20Id === membership.erc20Id,
                );
                const erc721Index = this.uniqueMembershipTokens.findIndex(
                    (membership: Membership) => this.memberships[id].erc721Id === membership.erc721Id,
                );
                if (erc20Index === -1 || erc721Index === -1) {
                    this.uniqueMembershipTokens.push(this.memberships[id]);
                }
            }
            this.loading = false;
        });
    }
}
</script>
