<template>
    <b-modal id="confirmationModal" :hidden="!visible" title="Test" centered> <p>This is a text</p> </b-modal>
</template>

<script setup lang="ts">
import { BModal } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'ModalConfirmation',
    components: {
        'b-modal': BModal,
    },
})
export default class BaseListGroupItemToken extends Vue {
    @Prop() visible!: boolean;
    @Prop() title!: string;
    @Prop() content!: string;
    @Prop() onConfirm!: () => void;
    @Prop() onCancel!: () => void;
    @Prop() confirmText!: string;
}
</script>
