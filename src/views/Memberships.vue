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
                    :key="key"
                    v-for="(membership, key) of memberships"
                />
            </b-list-group>
        </template>
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseListGroupItemMembership from '@/components/list-items/BaseListGroupItemMembership.vue';
import { IMemberships } from '@/store/modules/memberships';

@Component({
    name: 'AccountView',
    components: {
        BaseListGroupItemMembership,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
    }),
})
export default class PoolsView extends Vue {
    loading = true;
    profile!: UserProfile;
    memberships!: IMemberships;

    mounted() {
        this.$store.dispatch('memberships/getAll').then(async () => {
            const promises = Object.keys(this.memberships).map((id: string) =>
                this.$store.dispatch('memberships/get', id),
            );
            await Promise.all(promises);
            this.loading = false;
        });
    }
}
</script>
