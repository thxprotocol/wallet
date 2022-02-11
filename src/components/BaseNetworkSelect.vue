<template>
    <b-dropdown size="sm" variant="darker" no-caret>
        <template #button-content>
            <div class="d-flex align-items-center">
                <i
                    class="fas fa-code-branch p-1 mr-2"
                    :class="{ 'text-muted': !npid, 'text-success': npid }"
                    style="font-size: 1.5rem"
                ></i>
                <span class="d-none d-md-block text-muted">
                    {{ provider.name }}
                </span>
            </div>
        </template>
        <b-dropdown-item @click="onClick(NetworkProvider.Test)">
            <i class="fas fa-code-branch text-muted"></i> Polygon Test
        </b-dropdown-item>
        <b-dropdown-item @click="onClick(NetworkProvider.Main)">
            <i class="fas fa-code-branch text-success"></i> Polygon Main
        </b-dropdown-item>
    </b-dropdown>
</template>
<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { Network } from '@/store/modules/network';
import { NetworkProvider } from '@/utils/network';
import { BDropdown, BDropdownDivider, BDropdownItem } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
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
        privateKey: 'account/privateKey',
        provider: 'network/current',
    }),
})
export default class BaseNetworkSelect extends Vue {
    profile!: UserProfile;
    privateKey!: string;
    NetworkProvider = NetworkProvider;

    //getters
    provider!: Network;

    @Prop() npid!: NetworkProvider;

    async mounted() {
        await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });
    }

    async onClick(npid: NetworkProvider) {
        await this.$store.dispatch('network/setNetwork', { npid, privateKey: this.privateKey });
        this.$emit('change', npid);
    }
}
</script>
