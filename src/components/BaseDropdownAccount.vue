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
            <base-identicon
                :size="32"
                :rounded="true"
                :uri="`https://avatars.dicebear.com/api/identicon/${profile.id}.svg`"
                class="p-1 mr-md-2"
            />
            <span class="d-none d-md-block text-muted text-overflow-75">
                {{ profile.address }}
            </span>
        </template>
        <b-dropdown-item size="sm" variant="dark" v-clipboard:copy="profile.address">
            <span class="text-muted"> <i class="fas fa-clipboard mr-3"></i> Copy address </span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from './BaseIdenticon.vue';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseDropdownAccount extends Vue {
    profile!: UserProfile;
}
</script>
