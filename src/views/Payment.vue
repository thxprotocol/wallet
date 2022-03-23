<template>
    <div>
        <b-button @click="connect">
            Connect metamask
        </b-button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
    }),
})
export default class Payment extends Vue {
    async connect() {
        const provider = (window as any).ethereum || ((window as any).web3 && (window as any).web3.currentProvider);

        let accounts = null;
        let chainId = null;
        try {
            if (provider.request) {
                accounts = await provider.request({
                    method: 'eth_requestAccounts',
                });

                chainId = await provider.request({ method: 'eth_chainId' });
            }
        } catch (err) {
            if ((err as any).code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        }
        console.log(accounts);
        console.log(chainId);
    }
}
</script>
