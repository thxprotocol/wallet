<template>
    <b-dropdown size="sm" @show="getBalances()" variant="darker" no-caret v-if="profile">
        <template #button-content>
            <div class="d-flex align-items-center">
                <i class="fas fa-code-branch p-1 mr-2 text-success" style="font-size: 1.5rem"></i>
                <span class="d-none d-md-block text-muted">
                    Polygon
                </span>
            </div>
        </template>
        <b-dropdown-item target="_blank" :href="`https://mumbai.polygonscan.com/address/${profile.address}`">
            <i class="fas fa-code-branch text-muted mr-2"></i> Polygon Mumbai<br />
            <small class="text-muted">MATIC: {{ balances[0] }}</small>
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item target="_blank" :href="`https://polygonscan.com/address/${profile.address}`">
            <i class="fas fa-code-branch text-success mr-2"></i> Polygon Mainnet<br />
            <small class="text-muted">MATIC: {{ balances[1] }}</small>
        </b-dropdown-item>
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
        networks: 'network/all',
    }),
})
export default class BaseNetworkSelect extends Vue {
    balances = {
        [NetworkProvider.Test]: 0,
        [NetworkProvider.Main]: 0,
    };
    profile!: UserProfile;
    networks!: TNetworks;

    mounted() {
        this.getBalances();
    }

    getBalances() {
        this.getBalance(NetworkProvider.Test);
        this.getBalance(NetworkProvider.Main);
    }

    async getBalance(npid: NetworkProvider) {
        this.balances[npid] = Number(fromWei(await this.networks[npid].eth.getBalance(this.profile.address)));
    }
}
</script>
