<template>
    <b-dropdown id="dropdownNetworkSelect" :text="network.name" class="m-md-2">
        <b-dropdown-item @click="onClick(provider.Test)">
            Test Network
        </b-dropdown-item>
        <b-dropdown-item @click="onClick(provider.Main)">
            Main Network
        </b-dropdown-item>
    </b-dropdown>
</template>
<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { NetworkProvider } from '@/utils/network';
import { BDropdown, BDropdownItem } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import Web3 from 'web3';

@Component({
    name: 'BaseNetworkSelect',
    components: {
        'b-dropdown': BDropdown,
        'b-dropdown-item': BDropdownItem,
    },
    computed: mapGetters({
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        network: 'network/current',
        web3: 'network/web3',
    }),
})
export default class BaseNetworkSelect extends Vue {
    profile!: UserProfile;
    privateKey!: string;
    provider = NetworkProvider;
    web3!: Web3;

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
