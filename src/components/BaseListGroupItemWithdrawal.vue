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
                    !withdrawal.withdrawalId
                        ? `Withdrawal queued at ${format(new Date(withdrawal.createdAt), 'HH:mm MMMM dd, yyyy')}.`
                        : 'Withdrawal is processed.'
                "
                :class="withdrawal.approved ? 'fas' : 'far'"
                class="fa-check-circle"
            ></i>
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
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup, BBadge } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Membership } from '@/store/modules/memberships';
import { Withdrawal, WithdrawalType } from '@/store/modules/withdrawals';
import { format } from 'date-fns';
import { ERC20 } from '@/store/modules/erc20';

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
})
export default class BaseListGroupItemWithdrawal extends Vue {
    WithdrawalType = WithdrawalType;
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
