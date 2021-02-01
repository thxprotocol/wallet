<template>
    <div class="container mt-3" v-if="profile">
        <div class="row">
            <div class="col-md-6">
                <h2>Root Network</h2>
                <p class="text-muted">Ethereum Goerli</p>
                ETH: <code>{{ rootETH | fromWei }}</code>
                <br />
                ERC20: <code>{{ rootERC20 }}</code>
                <b-input-group class="mt-3">
                    <b-form-input type="number" v-model="amountDeposit"></b-form-input>
                    <b-input-group-append>
                        <b-button
                            class="btn-rounded"
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
            <div class="col-md-6">
                <h2>Child Network</h2>
                <p class="text-muted">Matic Mumbai</p>
                MATIC: <code>{{ childMATIC | fromWei }}</code>
                <br />
                ERC20: <code>{{ childERC20 }}</code>
                <b-input-group class="mt-3">
                    <b-form-input type="number" v-model="amountBurn"></b-form-input>
                    <b-input-group-append>
                        <b-button
                            class="btn-rounded"
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
        </div>
        <hr />
        <div v-if="profile.burnProofs.length">
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
                <burn-proof v-for="txHash of profile.burnProofs" :txHash="txHash" :key="txHash" />
            </b-list-group>
        </div>
    </div>
</template>

<script lang="ts">
import { BAlert, BButton, BFormInput, BInputGroup, BInputGroupAppend, BListGroup } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BurnProof from '@/components/BurnProof.vue';
import { Account, UserProfile } from '@/store/modules/account';

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
    computed: mapGetters({
        profile: 'account/profile',
        childMATIC: 'balance/childMATIC',
        rootERC20: 'balance/rootERC20',
        childERC20: 'balance/childERC20',
        rootETH: 'balance/rootETH',
    }),
})
export default class Wallet extends Vue {
    profile!: UserProfile;
    busy = {
        deposit: false,
        burn: false,
        exit: false,
    };
    txHash = '';
    amountDeposit = 0;
    amountBurn = 0;

    async mounted() {
        debugger;
        await this.$store.dispatch('balance/init', this.profile.address);
    }

    async deposit(amount: string) {
        this.busy.deposit = true;
        try {
            await this.$store.dispatch('balance/deposit', amount);
        } catch (e) {
            console.error(e);
            debugger;
        } finally {
            this.busy.deposit = false;
        }
    }

    async burn(amount: number) {
        this.busy.burn = true;
        try {
            const tx = await this.$store.dispatch('balance/burn', amount);

            if (tx.transactionHash) {
                const data = this.profile;

                data.burnProofs.push(tx.transactionHash);

                await this.$store.dispatch('account/update', data);
            }
        } catch (e) {
            console.error(e);
            debugger;
        } finally {
            this.busy.burn = false;
        }
    }
}
</script>
