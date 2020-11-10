<template>
    <b-modal id="modalSetPrivateKey" @show="onShow" centered scrollable title="Set a private key">
        <template v-slot:default>
            <div class="w-100 text-center" v-if="busy">
                <b-spinner variant="dark" />
            </div>
            <template v-else>
                <b-alert show variant="warning">
                    <strong>Create a secure backup of your private key elsewhere</strong>.</b-alert
                >
                <p>
                    This key is required to access your assets.
                    <strong>If you loose it, it can not be recovered.</strong> The wallet will only store your key on
                    this device.
                </p>
                <b-form-input size="lg" v-model="privateKey" placeholder="Enter a private key" />
            </template>
        </template>
        <template v-slot:modal-footer>
            <b-button class="mt-3 btn-rounded" block variant="success" @click="set()">
                Update
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import { ethers } from 'ethers';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account } from '../../store/modules/account';

@Component({
    name: 'ModalSetPrivateKey',
    components: {
        'b-form-input': BFormInput,
        'b-alert': BAlert,
        'b-link': BLink,
        'b-modal': BModal,
        'b-spinner': BSpinner,
        'b-button': BButton,
    },
    computed: mapGetters('account', ['account']),
})
export default class ModalSetPrivateKey extends Vue {
    busy = false;
    account!: Account;
    error = '';

    get privateKey() {
        return this.account.privateKey;
    }

    set privateKey(pKey: string) {
        this.$store.commit('account/updatePrivateKey', pKey);
    }

    async set() {
        this.busy = true;

        try {
            const account = new ethers.Wallet(this.privateKey);

            localStorage.setItem('thx:wallet:privatekey', this.privateKey);

            await this.$store.dispatch('account/update', { address: account.address });
            await this.$store.dispatch('account/init');

            this.$bvModal.hide('modalSetPrivateKey');
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }

    async onShow() {
        return;
    }
}
</script>
