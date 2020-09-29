<template>
    <div class="h-100">
        <modal-decode-withdraw-poll :result="result" />
        <qrcode-stream @decode="onDecode" :track="true"></qrcode-stream>
        <qrcode-capture
            id="qrcode-capture"
            class="d-none"
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
import ModalDecodeWithdrawPoll from '@/components/modals/ModalDecodeWithdrawPoll.vue';

interface QR {
    contractAddress: string;
    contract: string;
    method: string;
    params: any;
}

@Component({
    components: {
        'modal-decode-withdraw-poll': ModalDecodeWithdrawPoll,
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
    },
})
export default class Home extends Vue {
    result: QR | null = null;

    onDecode(decoded: string) {
        if (decoded.length) {
            this.result = JSON.parse(decoded);

            if (this.result) {
                this.$bvModal.show(`modalDecode${this.result.contract}`);
            }
        }
    }
}
</script>
<style>
.btn-upload {
    position: fixed;
    width: auto;
    bottom: 75px;
    right: 1rem;
    left: 1rem;
    border-radius: 25px;
}
</style>
