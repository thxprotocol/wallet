<template>
    <div class="container mt-3">
        <h2>Root Network</h2>
        <p class="text-muted">Ethereum Goerli</p>
        ETH: <code>{{ rootETH | fromWei }}</code>
        <br />
        ERC20: <code>{{ rootERC20 }}</code>
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
        <hr />
        <h2>Child Network</h2>
        <p class="text-muted">Matic Mumbai</p>
        ERC20: <code>{{ childERC20 }}</code>
        <br />
        MATIC: <code>{{ childMATIC | fromWei }}</code>
        <b-input-group class="mt-3">
            <b-form-input type="number" v-model="amountBurn"></b-form-input>
            <b-input-group-append>
                <b-button style="width: 100px;" :disabled="busy.burn" @click="burn(amountBurn)" variant="primary">
                    Withdraw
                </b-button>
            </b-input-group-append>
        </b-input-group>
        <hr />
        <div v-if="account.burnProofs.length">
            <h3>Burn proof</h3>
            <p>
                This will list your burn transactions. The proof is used to unlock the tokens in the root network. Start
                this process by exitting the proof.
            </p>
            <b-alert show variant="warning">
                <strong>Warning!</strong> Only remove your burn proof when you are sure your funds are unlocked in the
                root network.
            </b-alert>
            <b-list-group class="mt-3">
                <burn-proof v-for="txHash of account.burnProof" :txHash="txHash" :key="txHash" />
            </b-list-group>
        </div>
    </div>
</template>

<script lang="ts">
import { BAlert, BButton, BFormInput, BInputGroup, BInputGroupAppend, BListGroup } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BurnProof from '@/components/BurnProof.vue';
import { Account } from '@/store/modules/account';

@Component({
    components: {
        'burn-proof': BurnProof,
        'b-alert': BAlert,
        'b-button': BButton,
        'b-list-group': BListGroup,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
        'b-form-input': BFormInput,
    },
    computed: {
        ...mapGetters('account', ['account']),
        ...mapGetters('balance', ['rootMATIC', 'childMATIC', 'rootERC20', 'childERC20', 'rootETH', 'childETH']),
    },
})
export default class Wallet extends Vue {
    account!: Account;
    busy = {
        deposit: false,
        burn: false,
        exit: false,
    };
    txHash = '';
    amountDeposit = 0;
    amountBurn = 0;

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
            const data = this.account;

            data.burnProofs.push(tx.transactionHash);

            await this.$store.dispatch('account/updateProfile', data);
        }
        this.busy.burn = false;
    }
}
</script>
