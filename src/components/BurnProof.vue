<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <code class="text-overflow">
            {{ txHash }}
        </code>
        <b-button class="btn-rounded" :disabled="busy" variant="primary" @click="exit(txHash)" size="sm">
            Exit
        </b-button>
        <b-button class="ml-1 btn-rounded" :disabled="busy" variant="danger" @click="removeBurnProof(txHash)" size="sm">
            Remove
        </b-button>
    </b-list-group-item>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account } from '@/store/modules/account';

@Component({
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: mapGetters('account', ['account']),
})
export default class BurnProof extends Vue {
    account!: Account;
    busy = false;

    @Prop() txHash!: string;

    async removeBurnProof(txHash: string) {
        const data: Account = this.account;
        const index = data.burnProofs.indexOf(txHash);

        data.burnProofs.splice(index, 1);

        await this.$store.dispatch('account/update', data);
    }

    async exit(txHash: string) {
        this.busy = true;

        const tx = await this.$store.dispatch('balance/exit', txHash);
        console.log(tx);
        await this.removeBurnProof(txHash);

        this.busy = false;
    }
}
</script>
