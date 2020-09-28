<template>
    <b-modal id="modalDecode" title="Result" :show="show">
        <p>Click the button to toggle the overlay:</p>
        <code>{{ result }}</code>
    </b-modal>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account, Profile } from '@/store/modules/account';

@Component({
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: {
        ...mapGetters('account', ['account']),
    },
})
export default class ModalDecodeWithdrawPoll extends Vue {
    account!: Account;
    busy = false;

    @Prop() txHash!: string;

    async removeBurnProof(txHash: string) {
        const data: Profile = this.account.profile;
        const index = data.burnProof.indexOf(txHash);

        data.burnProof.splice(index, 1);

        await this.$store.dispatch('account/updateProfile', data);
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
