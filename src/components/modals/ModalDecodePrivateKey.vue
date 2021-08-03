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
                <code>{{ profile.address }}</code>
            </p>
            <p>
                New address:<br />
                <code>{{ account.address }}</code>
            </p>
            <p>
                Assets have been stored in your temporary wallet. Please provide your password (again) to transfer the
                ownership of your assets.
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
            <b-button class="mt-3 rounded-pill" block variant="primary" form="formPassword" type="submit">
                Transfer ownership
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import Web3 from 'web3';
import axios from 'axios';
import { UserProfile } from '@/store/modules/account';
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { isPrivateKey, signCall } from '@/utils/network';
import { Account } from 'web3/eth/accounts';
import { decryptString } from '@/utils/decrypt';

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
    busy = true;
    error = '';
    password = '';
    decryptedPrivateKey = '';

    tempAccount: Account | null = null;
    account: Account | null = null;

    @Prop() web3!: Web3;

    // getters
    profile!: UserProfile;
    privateKey!: string;

    onShow() {
        this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey) as any;
        this.busy = false;
        debugger;
    }

    async onSubmit() {
        this.busy = true;

        try {
            const tempPrivateKey = decryptString(this.profile.privateKey, this.password);

            if (isPrivateKey(tempPrivateKey)) {
                this.tempAccount = this.web3.eth.accounts.privateKeyToAccount(tempPrivateKey) as any;
            } else {
                throw new Error('Not a valid key');
            }

            for (const poolAddress of this.profile.memberships) {
                await this.transferOwnership(poolAddress);
            }

            await this.$store.dispatch('account/getProfile');

            if (this.profile.address !== this.tempAccount?.address) {
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

            if (this.tempAccount && this.account) {
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
            }
        } catch (e) {
            console.error(e);
            this.error = e.toString();
        }
    }
}
</script>
