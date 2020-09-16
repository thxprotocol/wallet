<template>
    <div class="home">
        <b-spinner v-if="busy.qrcode"></b-spinner>
        <qrcode-stream @init="busy.qrcode = false" @decode="onDecode" :track="repaint"></qrcode-stream>
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
            <div class="col-6">
                <b-button block :disabled="busy.deposit" @click="deposit()">Deposit</b-button>
            </div>
            <div class="col-6">
                <b-button block :disabled="busy.withdrawal" @click="withdraw()">Withdraw</b-button>
            </div>
        </div>
        <b-modal id="modalDecode" title="Result" :show="show">
            <b-overlay :show="!result" rounded="sm">
                <p>Click the button to toggle the overlay:</p>
                <code>{{ result }}</code>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script lang="ts">
import { MaticPOSClient } from '@maticnetwork/maticjs';
import { BAlert, BButton, BCard, BCardText, BModal, BOverlay, BSpinner } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader';
import { config } from '@/network';
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
        'qrcode-stream': QrcodeStream,
        'qrcode-capture': QrcodeCapture,
    },
    computed: {
        ...mapGetters('balance', ['rootBalance', 'childBalance']),
    },
})
export default class Home extends Vue {
    $bridge!: MaticPOSClient;
    result = {};
    busy = {
        qrcode: true,
        deposit: false,
        withdrawal: false,
    };
    rootBalance!: string;
    childBalance!: string;

    get show() {
        return this.result !== {};
    }

    repaint() {
        return true;
    }

    async withdraw() {
        this.busy.withdrawal = true;

        try {
            const txBurn = await this.$bridge.burnERC20(config.child.DERC20, this.childBalance, {
                from: config.user.address,
            });
            const txExit = await this.$bridge.exitERC20(txBurn.transactionHash, { from: config.user.address });

            this.busy.withdrawal = false;
        } catch (err) {
            console.error(err);
            this.busy.withdrawal = false;
        }
        this.busy.withdrawal = false;
    }

    async deposit() {
        this.busy.deposit = true;

        try {
            const txApprove = await this.$bridge.approveERC20ForDeposit(config.root.DERC20, this.rootBalance, {
                from: config.user.address,
            });
            console.log(txApprove.transactionHash);

            const txDeposit = await this.$bridge.depositERC20ForUser(
                config.root.DERC20,
                config.user.address,
                this.rootBalance,
                {
                    from: config.user.address,
                    gasPrice: '10000000000',
                },
            );
            console.log(txDeposit.transactionHash);

            this.busy.deposit = false;
        } catch (err) {
            console.error(err);
            this.busy.deposit = false;
        }
    }

    onDecode(decoded: string) {
        if (decoded.length) {
            this.result = JSON.parse(decoded);
            this.$bvModal.show('modalDecode');
        }
    }
}
</script>
