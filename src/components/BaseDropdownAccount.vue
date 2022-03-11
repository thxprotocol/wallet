<template>
    <div class="d-flex align-items-center">
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
                <span class="text-muted"> <i class="fas fa-clipboard mr-3"></i>Copy address </span>
            </b-dropdown-item>
        </b-dropdown>
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    name: 'BaseDropdownAccount',
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseDropdownAccount extends Vue {
    profile!: UserProfile;
}
</script>
