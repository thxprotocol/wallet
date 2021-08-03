<template>
    <b-modal
        id="modalDecodePrivateKey"
        @hidden="$emit('init')"
        no-close-on-esc
        no-close-on-backdrop
        hide-header-close
        centered
        scrollable
        title="Reclaim ownership over your assets"
    >
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <p>
                Temporary address:<br />
                <code class="text-overflow-75">{{ tempAccount.address }}</code>
            </p>
            <p>
                New address:<br />
                <code class="text-overflow-75">{{ account.address }}</code>
            </p>
            <p>
                Assets have been stored in your temporary wallet. Please provide your password (again) to transfer the
                ownership of assets in your temporary wallet to your new wallet address.
            </p>
            <form @submit.prevent="onSubmit()" id="formPassword">
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
            <b-button
                class="mt-3 rounded-pill"
                block
                variant="primary"
                form="formPassword"
                type="submit"
                :disabled="!tempAccount || !account"
            >
                Transfer ownership
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import Web3 from 'web3';
import axios from 'axios';
import { UserProfile } from '@/store/modules/account';
import { decryptString } from '@/utils/decrypt';
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { isPrivateKey, signCall } from '@/utils/network';
import { Account } from 'web3/eth/accounts';

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
        profile: 'account/profile',
        privateKey: 'account/privateKey',
    }),
})
export default class ModalDecodePrivateKey extends Vue {
    busy = false;
    error = '';
    password = '';
    decryptedPrivateKey = '';

    tempAccount!: Account;
    account!: Account;

    // getters
    profile!: UserProfile;
    privateKey!: string;

    @Prop() web3!: Web3;

    onShow() {
        try {
            const tempPrivateKey = decryptString(this.profile.privateKey, this.password);

            if (isPrivateKey(tempPrivateKey)) {
                this.tempAccount = this.web3.eth.accounts.privateKeyToAccount(tempPrivateKey) as any;
                this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey) as any;
            } else {
                throw new Error('Not a valid key');
            }
        } catch (e) {
            console.error(e);
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }

    async onSubmit() {
        this.busy = true;

        try {
            for (const poolAddress of this.profile.memberships) {
                await this.transferOwnership(poolAddress);
            }

            await this.$store.dispatch('account/getProfile');

            if (this.profile.address !== this.tempAccount.address) {
                this.$bvModal.hide('modalDecodePrivateKey');
            } else {
                throw new Error('Account not patched');
            }
        } catch (e) {
            console.error(e);
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }

    async transferOwnership(poolAddress: string) {
        try {
            const r = await axios({
                method: 'get',
                url: '/asset_pools/' + poolAddress,
                headers: { AssetPool: poolAddress },
            });

            await this.$store.dispatch('network/setNetwork', {
                npid: r.data.network,
                privateKey: this.privateKey,
            });

            const calldata = await signCall(
                this.web3,
                poolAddress,
                'upgradeAddress',
                [this.tempAccount.address, this.account.address],
                this.tempAccount,
            );

            if (!calldata.error) {
                const r = await this.$store.dispatch('assetpools/upgradeAddress', {
                    poolAddress,
                    data: calldata,
                });

                if (r.error) {
                    throw new Error('Upgrading address for pool failed');
                }
            }
        } catch (e) {
            console.error(e);
            this.error = e.toString();
        }
    }
}
</script>
