<template>
    <div class="home">
        <b-spinner v-if="!ready"></b-spinner>
        <qrcode-stream @init="init" @decode="onDecode" :track="repaint"></qrcode-stream>
        <qrcode-capture
            id="qrcode-capture"
            class="d-none"
            :capture="false"
            :multiple="false"
            @decode="onDecode"
        ></qrcode-capture>
        <hr />
        <label for="qrcode-capture" class="btn btn-primary btn-block">Upload</label>
        <b-modal id="modalDecode" title="Result" :show="show">
            <b-overlay :show="!result" rounded="sm">
                <p>Click the button to toggle the overlay:</p>
                <code>{{ result }}</code>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script lang="ts">
import { BAlert, BButton, BCard, BCardText, BModal, BOverlay, BSpinner } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';

@Component({
    components: {
        'b-alert': BAlert,
        'b-spinner': BSpinner,
        'b-modal': BModal,
        'b-button': BButton,
        'b-overlay': BOverlay,
        'b-card': BCard,
        'b-card-text': BCardText,
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
    },
})
export default class Home extends Vue {
    result = {};
    ready = false;

    get show() {
        return this.result !== {};
    }

    repaint() {
        return true;
    }

    init() {
        this.ready = true;
    }

    onDecode(decoded: string) {
        if (decoded.length) {
            this.result = JSON.parse(decoded);
            this.$bvModal.show('modalDecode');
        }
    }
}
</script>
