<template>
    <b-modal
        id="modalDecodePrivateKey"
        @hidden="$emit('init')"
        @show="onShow()"
        no-close-on-esc
        no-close-on-backdrop
        hide-header-close
        centered
        scrollable
        title="Decode and migrate your assets"
    >
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <p>
                Assets have been stored in your temporary account. Provide your password to transfer those assets to
                this wallet.
            </p>
            <form @submit.prevent="update()" id="formPassword">
                <b-form-input
                    autofocus
                    size="lg"
                    v-model="password"
                    type="password"
                    placeholder="Enter your password"
                />
            </form>
        </template>
        <template v-slot:modal-footer>
            <b-button class="mt-3 btn-rounded" block variant="success" form="formPassword" type="submit">
                Update
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import Web3 from 'web3';
import { UserProfile } from '@/store/modules/account';
import { decryptString } from '@/utils/decrypt';
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import { User } from 'oidc-client';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { isValidKey } from '@/utils/network';

@Component({
    name: 'ModalDecodePrivateKey',
    components: {
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
        privateKey: 'account/privateKey',
        address: 'account/address',
        provider: 'network/provider',
    }),
})
export default class ModalDecodePrivateKey extends Vue {
    busy = false;
    error = '';
    password = '';
    decryptedPrivateKey = '';

    // getters
    address!: string;
    user!: User;
    privateKey!: string;
    profile!: UserProfile;
    web3!: Web3;

    cancel() {
        this.$bvModal.hide('modalDecodePrivateKey');
    }

    async onShow() {
        try {
            this.$store.commit('network/connect', this.privateKey);
        } catch (e) {
            debugger;
        }
    }

    async upgradeAddress(originalPrivateKey: string) {
        try {
            for (const poolAddress of this.profile.memberships) {
                const signer = this.web3.eth.accounts.privateKeyToAccount(originalPrivateKey);
                const callData = {
                    poolAddress: poolAddress,
                    name: 'upgradeAddress',
                    args: [this.address],
                    signer,
                };

                await this.$store.dispatch('network/upgradeAddress', {
                    oldAddress: signer.address,
                    newAddress: this.address,
                    callData,
                });
            }
        } catch (e) {
            this.error = e.toString();
        }
    }

    async update() {
        this.busy = true;

        try {
            const decryptedPrivateKey = decryptString(this.profile.privateKey, this.password);

            if (isValidKey(decryptedPrivateKey)) {
                await this.upgradeAddress(decryptedPrivateKey);
                await this.$store.dispatch('account/getProfile');

                this.$bvModal.hide('modalDecodePrivateKey');
            } else {
                throw Error('Not a valid key');
            }
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
