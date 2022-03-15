<template>
    <b-modal :id="`modalTransferValue-${provider.id}`" centered scrollable title="Transfer MATIC to another wallet">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <p>
                Transfer MATIC from your THX Web Wallet to another wallet address on the selected Polygon network.
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
import { TNetworks } from '@/store/modules/network';
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput, BFormGroup } from 'bootstrap-vue';
import { User } from 'oidc-client';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
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
        user: 'account/user',
        profile: 'account/profile',
        networks: 'network/all',
        privateKey: 'account/privateKey',
    }),
})
export default class BaseModalTranferValue extends Vue {
    busy = false;
    error = '';
    amount = 0;
    to = '';

    // getters
    networks!: TNetworks;
    user!: User;
    profile!: UserProfile;

    @Prop() token!: ERC20;

    async transfer() {
        this.busy = true;

        try {
            const { error } = await this.$store.dispatch('network/sendValue', {
                networks: this.networks,
                to: this.to,
                amount: this.amount,
            });

            if (error) {
                throw new Error('Sending value failed.');
            }

            this.amount = 0;
            this.to = '';

            await this.$store.dispatch('network/getGasToken', {
                networks: this.networks,
                address: this.profile.address,
            });
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
