<template>
    <b-modal id="modalDepositPool" centered scrollable title="Deposit assets to this pool">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <p>
                Transfer tokens from your THX Web Wallet to this asset pool.
            </p>
            <form @submit.prevent="update()" id="formTransfer">
                <b-form-input autofocus size="lg" v-model="amount" type="number" placeholder="Amount to transfer" />
                <b-form-input size="lg" v-model="address" type="text" placeholder="Address of the receiver" />
            </form>
        </template>
        <template v-slot:modal-footer>
            <b-button class="mt-3 btn-rounded" block variant="success" form="formTransfer" type="submit">
                Transfer
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import { User } from 'oidc-client';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

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
        user: 'account/user',
        profile: 'account/profile',
        privateKey: 'account/privateKey',
    }),
})
export default class BaseModalDepositPool extends Vue {
    busy = false;
    error = '';
    amount = 0;

    // getters
    user!: User;
    profile!: UserProfile;
    privateKey!: string;

    async update() {
        this.busy = true;

        try {
            this.$store.dispatch('erc20/transfer', {});
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
