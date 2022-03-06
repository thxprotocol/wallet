<template>
    <b-modal
        v-if="membership"
        :id="`modalDepositPool-${membership.poolAddress}`"
        @show="getBalances()"
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
            <b-alert show variant="warning" v-if="!sufficientBalance && token">
                You do not have enough {{ membership.token.symbol }} on this account.
            </b-alert>
            <p>
                Transfer tokens from your THX Web Wallet to this asset pool.
            </p>
            <p v-if="token">
                Pool Balance: <code>{{ membership.token.balance }}</code>
                <br />
                Your Balance:
                <code>{{ token.balance }}</code>
            </p>
            <form @submit.prevent="deposit()" id="formAmount">
                <b-form-input autofocus size="lg" v-model="amount" type="number" placeholder="Specify the amount" />
            </form>
        </template>
        <template v-slot:modal-footer>
            <b-button
                :disabled="!sufficientBalance"
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
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import Web3 from 'web3';

@Component({
    name: 'ModalDepositPool',
    components: {
        'b-form-input': BFormInput,
        'b-alert': BAlert,
        'b-link': BLink,
        'b-modal': BModal,
        'b-spinner': BSpinner,
        'b-button': BButton,
    },
    computed: mapGetters({
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        erc20: 'erc20/all',
    }),
})
export default class BaseModalDepositPool extends Vue {
    busy = false;
    error = '';
    amount = 0;
    balance = '0';

    // getters
    profile!: UserProfile;
    privateKey!: string;
    erc20!: { [address: string]: ERC20 };

    @Prop() web3!: Web3;
    @Prop() membership!: Membership;

    get token() {
        return this.erc20[this.membership.token.address];
    }

    get sufficientBalance() {
        return Number(this.token?.balance) > 0;
    }

    async mounted() {
        await this.getBalances();
    }

    async getBalances() {
        try {
            await this.$store.dispatch('erc20/get', {
                web3: this.web3,
                poolToken: this.membership.token,
                profile: this.profile,
            });
        } catch (e) {
            this.error = 'Could not get pool token balances.';
            console.log(e);
        }
    }

    async deposit() {
        this.busy = true;

        try {
            const allowance = await this.$store.dispatch('erc20/allowance', {
                web3: this.web3,
                tokenAddress: this.membership.token.address,
                owner: this.profile.address,
                spender: this.membership.poolAddress,
                privateKey: this.privateKey,
            });

            if (Number(allowance) < Number(this.amount)) {
                await this.$store.dispatch('erc20/approve', {
                    web3: this.web3,
                    tokenAddress: this.membership.token.address,
                    to: this.membership.poolAddress,
                    amount: this.amount,
                    privateKey: this.privateKey,
                });
            }

            await this.$store.dispatch('assetpools/deposit', {
                web3: this.web3,
                poolAddress: this.membership.poolAddress,
                amount: this.amount,
                privateKey: this.privateKey,
            });

            await this.getBalances();
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
