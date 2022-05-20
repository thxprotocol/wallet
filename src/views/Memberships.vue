<template>
    <div v-if="profile" class="d-flex align-items-center justify-content-center">
        <b-spinner v-if="loading" variant="primary" class="m-auto" />
        <template v-else>
            <strong v-if="!Object.values(memberships).length" class="text-gray text-center">
                You are not a member to any pools.
            </strong>
            <b-list-group v-else class="w-100 align-self-start">
                <base-list-group-item-asset-pool
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
import BaseListGroupItemAssetPool from '@/components/BaseListGroupItemAssetPool.vue';
import { IMemberships } from '@/store/modules/memberships';

@Component({
    name: 'AccountView',
    components: {
        'base-list-group-item-asset-pool': BaseListGroupItemAssetPool,
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
        this.$store.dispatch('memberships/getAll').then(() => {
            const promises = [];

            for (const id in this.memberships) {
                promises.push(this.$store.dispatch('memberships/get', id));
            }

            Promise.all(promises);
            this.loading = false;
        });
    }
}
</script>
