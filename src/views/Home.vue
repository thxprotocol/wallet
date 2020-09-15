<template>
    <div class="home">
        <b-spinner v-if="!ready"></b-spinner>
        <qrcode-stream @init="init" @decode="onDecode" :track="repaint"></qrcode-stream>
        <qrcode-capture :capture="false" :multiple="false" @decode="onDecode"></qrcode-capture>
        <br />
        <code>
            {{ result }}
        </code>
    </div>
</template>

<script lang="ts">
import { BAlert, BSpinner } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';

@Component({
    components: {
        'b-alert': BAlert,
        'b-spinner': BSpinner,
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
