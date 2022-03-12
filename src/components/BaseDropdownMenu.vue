<template>
    <b-dropdown size="sm" variant="darker" no-caret toggle-class="d-flex align-items-center" v-if="profile">
        <template #button-content>
            <i class="fas fa-ellipsis-v p-1 mr-2 text-muted" aria-hidden="true" style="font-size: 1.5rem;"></i>
        </template>
        <b-dropdown-item to="/wallet">
            Wallet
        </b-dropdown-item>
        <b-dropdown-item to="/pools">
            Pools
        </b-dropdown-item>
        <b-dropdown-item to="/account" disabled>
            Account
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item to="/signout">
            Logout
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
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
}
</script>
