<template>
    <b-modal id="modalAssetPool" @show="reset()" centered scrollable title="Set a private key">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>

            <b-form-input readonly size="lg" v-model="privateKey" />
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
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account } from '../../store/modules/account';

@Component({
    name: 'ModalAssetPool',
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
export default class ModalSetAssetPool extends Vue {
    busy = false;
    error = '';

    account!: Account;

    reset() {
        this.busy = false;
        // Ask store to fetch asset pool info
        // Display title
        // Display owner
        // Display pool balance
        // Ask store to fetch member info for my account
        // Display account balance
    }
}
</script>
