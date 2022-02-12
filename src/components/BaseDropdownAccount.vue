<template>
    <b-dropdown
        size="sm"
        variant="darker"
        no-caret
        class="ml-2"
        toggle-class="d-flex align-items-center"
        v-if="profile"
    >
        <template #button-content>
            <img
                class="p-1 mr-md-2"
                :src="`https://avatars.dicebear.com/api/identicon/${profile.id}.svg`"
                height="32"
                alt="User identicon"
            />

            <span class="d-none d-md-block text-muted text-overflow-75">
                {{ profile.address }}
            </span>
        </template>
        <b-dropdown-item size="sm" variant="dark" v-clipboard:copy="profile.address">
            <span class="text-muted"> <i class="fas fa-copy mr-3"></i>Copy address </span>
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item to="/wallet">
            Wallet
        </b-dropdown-item>
        <b-dropdown-item to="/account">
            Pools
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item to="/signout">
            Logout
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { BDropdown, BDropdownDivider, BDropdownItem } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    name: 'BaseNetworkSelect',
    components: {
        BDropdown,
        BDropdownItem,
        BDropdownDivider,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseDropdownAccount extends Vue {
    profile!: UserProfile;

    async mounted() {
        const { result, error } = await this.$store.dispatch('account/getProfile');
        if (!result && error?.response?.status === 401) this.$router.push('/signin');
    }
}
</script>
