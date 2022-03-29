<template>
    <b-modal :id="`modalTransferTokens-${token.address}`" centered scrollable title="Transfer tokens to a wallet">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <p>
                Transfer tokens from your THX Web Wallet to another wallet address on the selected Polygon network.
            </p>
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
import { UserProfile } from '@/store/modules/account';
import { ERC20 } from '@/store/modules/erc20';
import { Membership } from '@/store/modules/memberships';
import { TNetworks } from '@/store/modules/network';
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput, BFormGroup } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    name: 'ModalDepositPool',
    components: {
        'b-form-group': BFormGroup,
        'b-form-input': BFormInput,
        'b-alert': BAlert,
        'b-link': BLink,
        'b-modal': BModal,
        'b-spinner': BSpinner,
        'b-button': BButton,
    },
    computed: mapGetters({
        networks: 'network/all',
        profile: 'account/profile',
        privateKey: 'account/privateKey',
    }),
})
export default class BaseModalTranferTokens extends Vue {
    busy = false;
    error = '';
    amount = 0;
    to = '';

    // getters
    networks!: TNetworks;
    profile!: UserProfile;
    privateKey!: string;

    @Prop() membership!: Membership;
    @Prop() token!: ERC20;

    async getBalances() {
        try {
            await this.$store.dispatch('erc20/get', {
                networks: this.networks,
                poolToken: this.token,
                profile: this.profile,
            });
            await this.$store.dispatch('network/getGasToken', {
                networks: this.networks,
                address: this.profile.address,
            });
        } catch (e) {
            this.error = 'Could not get pool token balances.';
            console.log(e);
        }
    }

    async transfer() {
        this.busy = true;

        try {
            const { error } = await this.$store.dispatch('erc20/approve', {
                token: this.token,
                network: this.membership.network,
                to: this.to,
                amount: this.amount,
            });

            if (!error) {
                const { error } = await this.$store.dispatch('erc20/transfer', {
                    token: this.token,
                    network: this.membership.network,
                    to: this.to,
                    amount: this.amount,
                });
                if (!error) {
                    this.amount = 0;
                    this.to = '';
                } else {
                    throw new Error('Transfer failed.');
                }
            } else {
                throw new Error('Tranfer approve failed.');
            }
        } catch (e) {
            this.error = (e as Error).toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
