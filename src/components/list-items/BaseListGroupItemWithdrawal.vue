<template>
    <b-list-group-item class="d-flex align-items-center w-100">
        <base-popover-transactions
            :transactions="withdrawal.transactions"
            :target="`popover-target-${withdrawal._id}`"
        />
        <div
            :id="`popover-target-${withdrawal._id}`"
            class="mr-3"
            :class="{
                'text-muted': !withdrawal.withdrawalId && !withdrawal.failReason,
                'text-primary': withdrawal.withdrawalId,
            }"
        >
            <i
                :class="{
                    far: withdrawal.state === WithdrawalState.Pending,
                    fas: withdrawal.state === WithdrawalState.Withdrawn,
                }"
                class="fa-check-circle"
            >
            </i>
        </div>
        <div class="mr-auto line-height-12">
            <strong class="font-weight-bold">
                {{ withdrawal.amount }}
                {{ erc20.symbol }}
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
            <span class="text-muted small" v-if="withdrawal.createdAt">
                Last update: {{ format(new Date(withdrawal.updatedAt), 'HH:mm MMMM dd, yyyy') }}
            </span>
        </div>
        <b-button
            variant="primary"
            :disabled="withdrawal.state === 1 || !withdrawal.withdrawalId || error || busy"
            @click="withdraw()"
        >
            Withdraw
        </b-button>
        <b-button hover-class="text-danger" class="ml-3" variant="light" :disabled="busy" @click="remove()">
            <i class="fas fa-trash m-0"></i>
        </b-button>
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Membership } from '@/store/modules/memberships';
import { Withdrawal, WithdrawalState, WithdrawalType } from '@/store/modules/withdrawals';
import { format } from 'date-fns';
import { ERC20 } from '@/store/modules/erc20';
import BasePopoverTransactions from '@/components/popovers/BasePopoverTransactions.vue';

@Component({
    components: {
        BasePopoverTransactions,
    },
})
export default class BaseListGroupItemWithdrawal extends Vue {
    WithdrawalType = WithdrawalType;
    WithdrawalState = WithdrawalState;
    busy = false;
    error = '';
    format = format;

    @Prop() erc20!: ERC20;
    @Prop() withdrawal!: Withdrawal;
    @Prop() membership!: Membership;

    async remove() {
        this.busy = true;

        const error = await this.$store.dispatch('withdrawals/remove', {
            membership: this.membership,
            withdrawal: this.withdrawal,
        });
        if (error) {
            this.error = error;
        }
        this.busy = false;
    }

    async withdraw() {
        this.busy = true;
        const error = await this.$store.dispatch('withdrawals/withdraw', {
            membership: this.membership,
            id: this.withdrawal.id,
        });
        if (error) {
            this.error = error;
        }
        this.busy = false;
    }
}
</script>
