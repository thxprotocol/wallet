<template>
    <div v-if="profile" class="d-flex align-items-center justify-content-center">
        <b-spinner v-if="loading" variant="primary" class="m-auto" />
        <template v-else>
            <strong v-if="!Object.values(memberships).length" class="text-gray text-center">
                You are not a member to any pools.
            </strong>
            <b-list-group v-else class="w-100 align-self-start">
                <base-list-group-item-membership
                    :membership="membership"
                    :key="membership.id"
                    v-for="membership of memberships"
                />
            </b-list-group>
        </template>
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseListGroupItemMembership from '@/components/BaseListGroupItemMembership.vue';
import { IMemberships } from '@/store/modules/memberships';
import { ERC20 } from '@/store/modules/erc20';
import { ERC721 } from '@/store/modules/erc721';

@Component({
    components: {
        BaseListGroupItemMembership,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
        erc20s: 'erc20/all',
    }),
})
export default class PoolsView extends Vue {
    loading = true;
    profile!: UserProfile;
    memberships!: IMemberships;
    erc20s!: { [id: string]: ERC20 };
    erc721s!: { [id: string]: ERC721 };

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

        this.$store.dispatch('memberships/getAll').then(async () => {
            const promises = [];

            for (const id in this.memberships) {
                promises.push(this.$store.dispatch('memberships/get', id));
            }

            await Promise.all(promises);

            this.loading = false;
        });
    }
}
</script>
