<template>
    <div v-if="profile">
        <b-list-group>
            <base-list-group-item-asset-pool
                :membership="membership"
                :key="membership.id"
                v-for="membership of memberships"
            />
        </b-list-group>
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
    // getters
    profile!: UserProfile;
    memberships!: IMemberships;

    mounted() {
        this.$store.dispatch('memberships/getAll');
    }
}
</script>
