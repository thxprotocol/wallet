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
        <template v-slot:modal-footer="{ ok }">
            <b-button class="mt-3" block variant="success" @click="ok()">
                Update
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';

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
})
export default class ModalSetPrivateKey extends Vue {
    busy = false;
    privateKey = '';

    async ok() {
        this.busy = true;
        debugger;
    }

    async onShow() {
        return;
    }
}
</script>
