<template>
    <b-list-group-item
        class="d-flex align-items-center w-100"
        :class="{ 'border-success': withdrawal.approved && !withdrawal.state }"
    >
        <strong class="font-weight-bold mr-auto">
            {{ withdrawal.amount }}
            {{ membership.token.symbol }}
        </strong>
        <b-button variant="primary" :disabled="withdrawal.state === 1" @click="withdraw(withdrawal)">
            Withdraw
        </b-button>
    </b-list-group-item>
</template>

<script lang="ts">
import Web3 from 'web3';
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup, BBadge } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { Membership } from '@/store/modules/memberships';
import { Withdrawal } from '@/store/modules/withdrawals';
import { signCall } from '@/utils/network';

@Component({
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: mapGetters({
        web3: 'network/web3',
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        memberships: 'memberships/all',
        withdrawals: 'withdrawals/all',
    }),
})
export default class BaseListGroupItemWithdrawal extends Vue {
    busy = true;
    error = '';

    // getters
    profile!: UserProfile;
    privateKey!: string;
    web3!: Web3;

    @Prop() withdrawal!: Withdrawal;
    @Prop() membership!: Membership;

    async withdraw(withdrawal: Withdrawal) {
        this.busy = true;
        try {
            const calldata = await signCall(
                this.web3,
                this.$route.params.address,
                'withdrawPollFinalize',
                [withdrawal.id],
                this.web3.eth.accounts.privateKeyToAccount(this.privateKey),
            );

            if (!calldata.error) {
                const r = await this.$store.dispatch('assetpools/withdrawPollCall', {
                    poolAddress: this.$route.params.address,
                    call: calldata.call,
                    nonce: calldata.nonce,
                    sig: calldata.sig,
                });

                if (r.error) {
                    throw new Error('Withdraw Poll call failed');
                }

                this.$store.commit('withdrawals/unset', { withdrawal, membership: this.membership });
            }
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
