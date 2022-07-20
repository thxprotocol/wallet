<template>
    <b-modal :id="`modalTransferTokens-${erc20.address}`" @show="reset" centered scrollable title="Transfer tokens">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <p>
                Transfer tokens from your THX Web Wallet to another wallet address.
            </p>
            <b-alert variant="info" show>
                Transactions out of your wallet are not covered by our gasless policy, so make sure to have some MATIC
                in this account.
            </b-alert>
            <form @submit.prevent="transfer()" id="formTransfer">
                <b-form-group>
                    <b-form-input autofocus size="lg" v-model="amount" type="number" placeholder="Amount to transfer" />
                </b-form-group>
                <b-form-group>
                    <b-form-input size="lg" v-model="to" type="text" placeholder="Address of the receiver" />
                </b-form-group>
            </form>
        </template>
        <template v-slot:modal-footer>
            <b-button class="rounded-pill" block variant="primary" form="formTransfer" type="submit">
                Transfer
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { ERC20 } from '@/store/modules/erc20';
import { Membership } from '@/store/modules/memberships';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModalTranferTokens extends Vue {
    busy = false;
    error = '';
    amount = 0;
    to = '';

    @Prop() membership!: Membership;
    @Prop() erc20!: ERC20;

    reset() {
        this.amount = 0;
        this.to = '';
    }

    async transfer() {
        this.busy = true;

        await this.$store.dispatch('erc20/approve', {
            token: this.erc20,
            chainId: this.erc20.chainId,
            to: this.to,
            amount: this.amount,
        });

        await this.$store.dispatch('erc20/transfer', {
            token: this.erc20,
            chainId: this.membership.chainId,
            to: this.to,
            amount: this.amount,
        });

        await this.$store.dispatch('erc20/balanceOf', this.erc20);

        this.reset();
        this.$bvModal.hide(`modalTransferTokens-${this.erc20.address}`);
        this.busy = false;
    }
}
</script>
