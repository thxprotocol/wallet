<template>
    <b-list-group-item class="d-flex align-items-center w-100">
        <div
            class="mr-3"
            :class="{
                'text-muted': !withdrawal.withdrawalId && !withdrawal.failReason,
                'text-primary': withdrawal.withdrawalId,
                'text-danger': withdrawal.failReason,
            }"
        >
            <i
                v-if="withdrawal.failReason"
                v-b-tooltip.hover
                :title="withdrawal.failReason"
                class="fas fa-exclamation-circle"
            ></i>
            <i
                v-else
                v-b-tooltip.hover
                :title="
                    !withdrawal.withdrawalId ? 'Withdrawal is scheduled to be processed.' : 'Withdrawal is processed.'
                "
                :class="withdrawal.approved ? 'fas' : 'far'"
                class="fa-check-circle"
            ></i>
        </div>
        <div class="mr-auto line-height-12">
            <strong class="font-weight-bold">
                {{ withdrawal.amount }}
                {{ membership.token.symbol }}
                <i
                    v-if="withdrawal.type === WithdrawalType.ClaimReward"
                    v-b-tooltip.hover
                    title="You have claimed this reward yourself."
                    class="text-muted fas fa-gift"
                ></i>
                <i
                    v-if="withdrawal.type === WithdrawalType.ClaimRewardFor"
                    v-b-tooltip.hover
                    title="You have been given this reward."
                    class="text-muted fas fa-award"
                ></i>
                <i
                    v-if="withdrawal.type === WithdrawalType.ProposeWithdrawal"
                    v-b-tooltip.hover
                    title="You have been given this amount of tokens."
                    class="text-muted fas fa-coins"
                ></i>
            </strong>

            <br />
            <span class="text-muted small">
                {{ format(new Date(withdrawal.createdAt), 'HH:mm MMMM dd, yyyy') }}
            </span>
        </div>
        <b-button
            variant="primary"
            :disabled="withdrawal.state === 1 || !withdrawal.withdrawalId || error || busy"
            @click="withdraw()"
        >
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
import { Withdrawal, WithdrawalType } from '@/store/modules/withdrawals';
import { signCall } from '@/utils/network';
import { format } from 'date-fns';

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
    WithdrawalType = WithdrawalType;
    busy = false;
    error = '';
    format = format;

    // getters
    profile!: UserProfile;
    privateKey!: string;
    web3!: Web3;

    @Prop() withdrawal!: Withdrawal;
    @Prop() membership!: Membership;

    async withdraw() {
        this.busy = true;
        try {
            const calldata = await signCall(
                this.web3,
                this.membership.poolAddress,
                'withdrawPollFinalize',
                [this.withdrawal.withdrawalId],
                this.web3.eth.accounts.privateKeyToAccount(this.privateKey),
            );

            if (!calldata.error) {
                await this.$store.dispatch('assetpools/withdraw', {
                    poolAddress: this.membership.poolAddress,
                    call: calldata.call,
                    nonce: calldata.nonce,
                    sig: calldata.sig,
                });

                const withdrawal = this.withdrawal;
                withdrawal.state = 1;
                this.$store.commit('withdrawals/set', { withdrawal, membership: this.membership });
            }
        } catch (error) {
            this.error = (error as Error).toString();
            debugger;
        } finally {
            this.busy = false;
        }
    }
}
</script>
