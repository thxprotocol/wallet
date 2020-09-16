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
        <label for="qrcode-capture" class="d-block">
            <span class="btn btn-primary btn-block">Upload</span>
        </label>
        <hr />
        <code>
            {{ result }}
        </code>
    </div>
</template>

<script lang="ts">
import { BAlert, BButton, BSpinner } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';

@Component({
    components: {
        'b-alert': BAlert,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
    },
})
export default class Home extends Vue {
    result = {};
    ready = false;

    repaint() {
        return true;
    }

    init() {
        this.ready = true;
    }

    onDecode(decoded: string) {
        if (decoded.length) {
            this.result = JSON.parse(decoded);
        }
    }
}
</script>
