<template>
    <b-modal
        v-if="membership"
        :id="`modalDepositPool-${membership.id}`"
        @show="onShow()"
        centered
        scrollable
        title="Deposit assets to this pool"
    >
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <b-alert :show="hasInsufficientBalance" variant="warning">
                You do not have enough {{ membership.token.symbol }} on this account.
            </b-alert>
            <form @submit.prevent="deposit()" id="formAmount">
                <b-form-input autofocus disabled size="lg" :value="amount" type="number" />
            </form>
        </template>
        <template v-slot:modal-footer>
            <b-button
                :disabled="hasInsufficientBalance"
                class="mt-3 btn-rounded"
                block
                variant="primary"
                form="formAmount"
                type="submit"
            >
                Deposit
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { ERC20 } from '@/store/modules/erc20';
import { Membership } from '@/store/modules/memberships';
import { TNetworks } from '@/store/modules/network';
import { MAX_UINT256, signCall } from '@/utils/network';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { toWei } from 'web3-utils';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        privateKey: 'account/privateKey',
    }),
})
export default class BaseModalDepositPool extends Vue {
    busy = false;
    error = '';
    balance = 0;
    allowance = 0;
    token?: ERC20;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    privateKey!: string;

    @Prop() membership!: Membership;
    @Prop() item!: string;
    @Prop() amount!: number;

    get hasInsufficientBalance() {
        return this.balance < this.amount;
    }

    async onShow() {
        this.$store
            .dispatch('memberships/get', this.membership.id)
            .then(async ({ membership }: { membership: Membership; error: Error }) => {
                const web3 = this.networks[membership.network];
                const { erc20 } = await this.$store.dispatch('erc20/get', {
                    web3,
                    membership,
                });
                this.token = erc20;
                this.getBalance();
            });
    }

    async getBalance() {
        const { balance } = await this.$store.dispatch('erc20/balanceOf', {
            token: this.token,
            profile: this.profile,
        });
        this.balance = Number(balance);
    }

    async deposit() {
        this.busy = true;
        const { allowance } = await this.$store.dispatch('erc20/allowance', {
            token: this.token,
            owner: this.profile.address,
            spender: this.membership.poolAddress,
        });
        this.allowance = Number(allowance);

        if (this.allowance < Number(this.amount)) {
            await this.$store.dispatch('erc20/approve', {
                token: this.token,
                to: this.membership.poolAddress,
                amount: MAX_UINT256,
            });
        }

        const calldata = await signCall(
            this.networks[this.membership.network],
            this.membership.poolAddress,
            'deposit',
            [toWei(String(this.amount), 'ether')],
            this.privateKey,
        );

        await this.$store.dispatch('deposits/create', {
            membership: this.membership,
            calldata,
            item: this.item,
        });

        await this.getBalance();
        this.$bvModal.hide(`modalDepositPool-${this.membership.id}`);
        this.busy = false;
    }
}
</script>
