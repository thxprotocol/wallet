<template>
    <b-modal
        v-if="membership"
        :id="`modalERC20Swap-${membership.id}`"
        @show="onShow()"
        centered
        scrollable
        title="Swap"
    >
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-if="!busy && tokenIn">
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <b-alert :show="hasInsufficientBalance" variant="warning">
                You do not have enough {{ tokenIn.symbol }} on this account.
            </b-alert>
            <b-alert :show="hasInsufficientMATICBalance" variant="warning">
                A balance of <strong>{{ maticBalance }} MATIC</strong> is not enough to pay for gas.
            </b-alert>
            <form @submit.prevent="swap()" id="formAmount">
                <b-form-input autofocus size="lg" v-model="amount" type="number" :v-on="updateSwapProvisioning()" />
            </form>
            <p class="small text-muted mt-2 mb-0">
                Your balance: <strong>{{ tokenIn.balance }} {{ tokenIn.symbol }}</strong> (
                <b-link @click="amount = Number(tokenIn.balance)">
                    Set Max
                </b-link>
                )
            </p>
            <p class="small text-muted mt-2 mb-0">
                You receive: <strong>{{ tokenInPrevisionedAmount }} {{ token.symbol }}</strong>
            </p>
        </template>
        <template v-slot:modal-footer>
            <b-button
                :disabled="hasInsufficientBalance || amount <= 0"
                class="mt-3 btn-rounded"
                block
                variant="primary"
                form="formAmount"
                type="submit"
            >
                Swap
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { ERC20 } from '@/store/modules/erc20';
import { ERC20SwapRuleExtended } from '@/store/modules/erc20swaprules';
import { Membership } from '@/store/modules/memberships';
import { TNetworks } from '@/store/modules/network';
import { ChainId, MAX_UINT256, signCall } from '@/utils/network';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { fromWei, toWei } from 'web3-utils';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        privateKey: 'account/privateKey',
        erc20s: 'erc20/all',
    }),
})
export default class BaseModalERC20Swap extends Vue {
    busy = false;
    error = '';
    balance = 0;
    allowance = 0;
    amount = 0;
    maticBalance = 0;
    tokenInPrevisionedAmount = 0;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    privateKey!: string;
    erc20s!: { [id: string]: ERC20 };

    @Prop() membership!: Membership;
    @Prop() swaprule!: ERC20SwapRuleExtended;

    get token() {
        return this.erc20s[this.membership.erc20];
    }

    get tokenIn() {
        return this.swaprule.erc20; //this.erc20s[this.swaprule.erc20._id];
    }

    get hasInsufficientBalance() {
        return Number(this.tokenIn.balance) < this.amount;
    }

    get hasInsufficientMATICBalance() {
        return this.membership.chainId != ChainId.Hardhat && this.maticBalance == 0;
    }

    async onShow() {
        const web3 = this.networks[this.membership.chainId];
        this.maticBalance = Number(fromWei(await web3.eth.getBalance(this.profile.address)));
        const wei = await this.tokenIn.contract.methods.balanceOf(this.profile.address).call();
        this.tokenIn.balance = fromWei(wei);
    }

    updateSwapProvisioning() {
        this.tokenInPrevisionedAmount = this.amount > 0 ? this.amount * this.swaprule.tokenMultiplier : 0;
    }

    async swap() {
        this.busy = true;

        const { allowance } = await this.$store.dispatch('erc20/allowance', {
            token: this.tokenIn,
            owner: this.profile.address,
            spender: this.membership.poolAddress,
        });
        this.allowance = Number(allowance);

        const amountInToWei = toWei(String(this.amount));

        if (this.allowance < Number(amountInToWei)) {
            await this.$store.dispatch('erc20/approve', {
                token: this.tokenIn,
                chainId: this.membership.chainId,
                to: this.membership.poolAddress,
                poolAddress: this.membership.poolAddress,
                amount: MAX_UINT256,
            });
        }

        const calldata = await signCall(
            this.networks[this.membership.chainId],
            this.membership.poolAddress,
            'swap',
            [amountInToWei, this.swaprule.tokenInAddress],
            this.privateKey,
        );

        await this.$store.dispatch('erc20swaps/create', {
            membership: this.membership,
            calldata,
            amountIn: this.amount,
            tokenInAddress: this.swaprule.tokenInAddress,
        });

        this.$store.dispatch('memberships/get', this.membership.id);
        this.$bvModal.hide(`modalERC20Swap-${this.membership.id}`);
        this.busy = false;
        this.$router.push({ path: '/wallet' });
    }
}
</script>
