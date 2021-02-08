<template>
    <div class="h-100 d-flex align-items-center justify-content-center">
        <modal-decode-qr @reset="reset()" :result="result" v-if="result" />
        <b-spinner variant="dark" />
        <qrcode-stream @decode="onDecode" track></qrcode-stream>
        <qrcode-capture
            id="qrcode-capture"
            hidden
            :capture="false"
            :multiple="false"
            @decode="onDecode"
        ></qrcode-capture>
        <label for="qrcode-capture" class="btn btn-primary btn-lg btn-upload">Upload</label>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';
import { BSpinner } from 'bootstrap-vue';
import ModalDecodeQR from '@/components/modals/ModalDecodeQR.vue';

@Component({
    components: {
        'modal-decode-qr': ModalDecodeQR,
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
        'b-spinner': BSpinner,
    },
})
export default class Home extends Vue {
    result: any | null = null;
    busy = true;

    reset() {
        this.result = null;
    }

    onDecode(decoded: string) {
        if (decoded.length) {
            this.result = JSON.parse(decoded);
        }
    }
}
</script>
<style>
.wrapper {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.btn-upload {
    position: fixed;
    width: auto;
    bottom: 75px;
    right: 1rem;
    left: 1rem;
    border-radius: 25px;
}
</style>
