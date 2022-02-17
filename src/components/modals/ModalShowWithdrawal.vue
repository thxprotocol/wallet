<template>
    <b-modal
        id="modalShowWithdrawal"
        hide-header
        hide-header-close
        body-bg-variant="darker"
        body-text-variant="white"
        body-class="p-5"
        footer-bg-variant="darker"
        footer-border-variant="dark"
        no-close-on-backdrop
        no-close-on-esc
        size="lg"
        centered
    >
        <div class="img-treasure" :style="`background-image: url(${require('@/assets/img/thx_treasure.png')});`"></div>
        <h2 class="text-secondary text-center my-3">
            <strong>Congratulations!</strong> You've earned
            <strong>{{ withdrawal.amount }} {{ withdrawal.tokenSymbol }}</strong>
        </h2>
        <p class="lead text-center">Keep an eye on your {{ withdrawal.tokenSymbol }} pool for utility options.</p>
        <template v-slot:modal-footer>
            <b-button class="rounded-pill" block variant="primary" @click="$emit('redirect')" type="submit">
                Continue
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModalShowWithdrawal extends Vue {
    @Prop() withdrawal!: any;

    mounted() {
        this.$bvModal.show('modalShowWithdrawal');
    }
}
</script>
<style scoped>
.img-treasure {
    background-size: contain;
    background-repeat: no-repeat;
    min-height: 250px;
    background-position: center center;
}
</style>
