<template>
    <div class="form-group">
        <b-form-input
            autofocus
            size="lg"
            v-model="input"
            :state="valid"
            @input="onInput()"
            placeholder="Enter a private key"
        />
        <small v-if="!valid" class="text-danger">
            Please enter a valid private key.
        </small>
    </div>
</template>
<script lang="ts">
import { BFormInput } from 'bootstrap-vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ethers } from 'ethers';

@Component({
    name: 'AccountView',
    components: {
        'b-form-input': BFormInput,
    },
})
export default class InputPrivateKey extends Vue {
    input = '';
    valid = false;

    @Prop() value!: string;

    mounted() {
        this.input = this.value;
        this.onInput();
    }

    onInput() {
        try {
            const account = new ethers.Wallet(this.input);
            ethers.utils.isAddress(account.address);
            this.valid = true;
        } catch (e) {
            this.valid = false;
        } finally {
            this.$emit('validated', this.valid);
        }
    }
}
</script>
