<template>
    <b-dropdown size="sm" variant="darker" no-caret>
        <template #button-content>
            <div class="d-flex align-items-center">
                <i class="fas fa-code-branch p-1 mr-2 text-success" style="font-size: 1.5rem"></i>
                <span class="d-none d-md-block text-muted">
                    Polygon
                </span>
            </div>
        </template>
        <b-dropdown-item> <i class="fas fa-code-branch text-muted"></i> Polygon Test </b-dropdown-item>
        <b-dropdown-item> <i class="fas fa-code-branch text-success"></i> Polygon Main </b-dropdown-item>
    </b-dropdown>
</template>
<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { TNetworks } from '@/store/modules/network';
import { NetworkProvider } from '@/utils/network';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { fromWei } from 'web3-utils';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        privateKey: 'account/privateKey',
    }),
})
export default class BaseNetworkSelect extends Vue {
    balances!: { [NetworkProvider.Test]: number; [NetworkProvider.Main]: number };

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    privateKey!: string;

    async mounted() {
        if (!this.profile) {
            await this.$store.dispatch('account/getProfile');
        }
        await this.$store.dispatch('network/setNetwork', { npid: NetworkProvider.Test, privateKey: this.privateKey });
        await this.$store.dispatch('network/setNetwork', { npid: NetworkProvider.Main, privateKey: this.privateKey });
    }

    async getBalance(npid: NetworkProvider) {
        const web3 = this.networks[npid];
        this.balances[npid] = Number(fromWei(await web3.eth.getBalance(this.profile.address)));
    }
}
</script>
