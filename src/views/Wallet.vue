<template>
    <div class="wallet"></div>
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
    },
})
export default class Home extends Vue {}
</script>
