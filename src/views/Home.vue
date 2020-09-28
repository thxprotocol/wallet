<template>
    <div class="home">
        <qrcode-stream @decode="onDecode" :track="true"></qrcode-stream>
        <qrcode-capture
            id="qrcode-capture"
            class="d-none"
            :capture="false"
            :multiple="false"
            @decode="onDecode"
        ></qrcode-capture>
        <hr />
        <label for="qrcode-capture" class="btn btn-primary btn-block">Upload</label>
        <div class="row mt-3">
            <div class="col-12">
                <b-input-group class="mt-3">
                    <b-form-input type="number" v-model="amountDeposit"></b-form-input>
                    <b-input-group-append>
                        <b-button
                            style="width: 100px;"
                            :disabled="busy.deposit"
                            @click="deposit(amountDeposit)"
                            variant="primary"
                        >
                            Deposit
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>
            <div class="col-12">
                <b-input-group class="mt-3">
                    <b-form-input type="number" v-model="amountBurn"></b-form-input>
                    <b-input-group-append>
                        <b-button
                            style="width: 100px;"
                            :disabled="busy.burn"
                            @click="burn(amountBurn)"
                            variant="primary"
                        >
                            Withdraw
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>
            <div class="col-md-12">
                <b-list-group class="mt-3">
                    <burn-proof v-for="txHash of account.profile.burnProof" :txHash="txHash" :key="txHash" />
                </b-list-group>
            </div>
        </div>
        <b-modal id="modalDecode" title="Result" :show="show">
            <p>Click the button to toggle the overlay:</p>
            <code>{{ result }}</code>
        </b-modal>
    </div>
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
    BModal,
    BOverlay,
    BSpinner,
    BListGroup,
} from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';
import { mapGetters } from 'vuex';
import { Account, Profile } from '@/store/modules/account';
import BurnProof from '@/components/BurnProof.vue';

@Component({
    components: {
        'burn-proof': BurnProof,
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-modal': BModal,
        'b-button': BButton,
        'b-overlay': BOverlay,
        'b-list-group': BListGroup,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-form-input': BFormInput,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
    },
    computed: {
        ...mapGetters('account', ['account']),
        ...mapGetters('balance', ['rootMATIC', 'childMATIC']),
    },
})
export default class Home extends Vue {
    $bridge!: MaticPOSClient;
    result = {};
    busy = {
        deposit: false,
        burn: false,
        exit: false,
    };
    rootBalance!: string;
    childBalance!: string;
    rootMATIC!: string;
    childMATIC!: string;
    txHash = '';
    amountDeposit = 0;
    amountBurn = 0;
    account!: Account;

    get show() {
        return this.result !== {};
    }

    async deposit(amount: number) {
        this.busy.deposit = true;

        await this.$store.dispatch('balance/deposit', amount);

        this.busy.deposit = false;
    }

    async burn(amount: number) {
        this.busy.burn = true;

        const tx = await this.$store.dispatch('balance/burn', amount).catch(e => {
            console.error(e);
        });
        console.log(tx);

        if (tx.transactionHash) {
            const data: Profile = this.account.profile;

            data.burnProof.push(tx.transactionHash);

            await this.$store.dispatch('account/updateProfile', data);
        }
        this.busy.burn = false;
    }

    onDecode(decoded: string) {
        if (decoded.length) {
            this.result = JSON.parse(decoded);
            this.$bvModal.show('modalDecode');
        }
    }
}
</script>
