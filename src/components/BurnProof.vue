<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <code class="text-overflow">
            {{ txHash }}
        </code>
        <b-button :disabled="busy" variant="primary" @click="exit(txHash)" size="sm">
            Exit
        </b-button>
        <b-button class="ml-1" :disabled="busy" variant="danger" @click="removeBurnProof(txHash)" size="sm">
            Remove
        </b-button>
    </b-list-group-item>
</template>

<script lang="ts">
import { MaticPOSClient } from '@maticnetwork/maticjs';
import {
    BLink,
    BAlert,
    BButton,
    BCard,
    BCardText,
    BFormInput,
    BInputGroup,
    BInputGroupAppend,
    BSpinner,
    BListGroupItem,
    BListGroup,
} from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';
import { mapGetters } from 'vuex';
import { Account, Profile } from '@/store/modules/account';
import { TransactionObject } from 'web3/eth/types';

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
export default class BurnProof extends Vue {
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
