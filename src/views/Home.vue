<template>
    <div class="home">
        <b-spinner v-if="busy.qrcode"></b-spinner>
        <qrcode-stream @init="busy.qrcode = false" @decode="onDecode" :track="true"></qrcode-stream>
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
                        <b-button @click="deposit(amountDeposit)" variant="primary">
                            Deposit
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>
            <div class="col-12">
                <b-input-group class="mt-3">
                    <b-form-input type="number" v-model="amountBurn"></b-form-input>
                    <b-input-group-append>
                        <b-button :disabled="busy.burn" @click="burn(amountBurn)" variant="primary">
                            Withdraw: Burn
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
                <b-alert variant="warning" v-if="txHash">
                    Store this transactionHash somewhere!<br />
                    <strong>{{ txHash }}</strong>
                </b-alert>
            </div>
            <div class="col-md-12">
                <b-input-group class="mt-3">
                    <b-form-input v-model="txHash"></b-form-input>
                    <b-input-group-append>
                        <b-button :disabled="busy.exit" @click="exit(txHash)" variant="primary">
                            Withdraw: Exit
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>
        </div>
        <b-modal id="modalDecode" title="Result" :show="show">
            <b-overlay :show="!busy.qrcode" rounded="sm">
                <p>Click the button to toggle the overlay:</p>
                <code>{{ result }}</code>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script lang="ts">
import { MaticPOSClient } from '@maticnetwork/maticjs';
import {
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
} from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';
import { mapGetters } from 'vuex';

@Component({
    components: {
        'b-alert': BAlert,
        'b-spinner': BSpinner,
        'b-modal': BModal,
        'b-button': BButton,
        'b-overlay': BOverlay,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-form-input': BFormInput,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
    },
    computed: {
        ...mapGetters('balance', ['rootMATIC', 'childMATIC']),
    },
})
export default class Home extends Vue {
    $bridge!: MaticPOSClient;
    result = {};
    busy = {
        qrcode: true,
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
        if (tx) {
            // Store this hash in mongo
            this.txHash = tx.transactionHash;
            this.exit(tx.transactionHash);
        }
        this.busy.burn = false;
    }

    async exit(txHash: string) {
        this.busy.exit = true;
        const tx = await this.$store.dispatch('balance/exit', txHash).catch(e => {
            console.error(e);
        });
        console.log(tx);
        this.busy.exit = false;
    }

    onDecode(decoded: string) {
        if (decoded.length) {
            this.result = JSON.parse(decoded);
            this.$bvModal.show('modalDecode');
        }
    }
}
</script>
