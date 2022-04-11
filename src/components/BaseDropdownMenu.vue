<template>
    <b-dropdown size="sm" variant="darker" no-caret toggle-class="d-flex align-items-center" v-if="profile">
        <template #button-content>
            <i class="fas fa-ellipsis-v p-1 mr-2 text-muted" aria-hidden="true" style="font-size: 1.5rem;"></i>
        </template>
        <b-dropdown-item to="/wallet">
            Wallet
        </b-dropdown-item>
        <b-dropdown-item to="/memberships">
            Pools
        </b-dropdown-item>
        <b-dropdown-item to="/account">
            Account
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item :href="dashboardUrl">
            <span class="text-muted"><i class="fas fa-chart-line mr-3"></i>Go to Dashboard</span>
        </b-dropdown-item>
        <b-dropdown-item size="sm" variant="dark" to="/signout">
            <span class="text-muted"><i class="fas fa-sign-out-alt mr-3"></i>Logout</span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { DASHBOARD_URL } from '@/utils/secrets';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    name: 'BaseDropdownMenu',
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseDropdownMenu extends Vue {
    profile!: UserProfile;
    dashboardUrl = DASHBOARD_URL;
}
</script>
