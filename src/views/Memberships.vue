<template>
    <div class="" v-if="profile">
        <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>
        <b-alert show variant="info" dismissible @dismissed="info = ''" v-if="info">{{ info }}</b-alert>
        <b-list-group>
            <b-list-group-item class="text-center" v-if="busy">
                <b-spinner variant="primary" />
            </b-list-group-item>
            <template v-if="!busy">
                <base-list-group-item-asset-pool
                    :membership="membership"
                    :key="membership.id"
                    v-for="membership of memberships"
                />
            </template>
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
    busy = true;
    error = '';
    info = '';

    // getters
    profile!: UserProfile;
    memberships!: IMemberships;

    async mounted() {
        this.busy = true;

        try {
            await this.$store.dispatch('memberships/getAll');
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.busy = false;
        }
    }
}
</script>
