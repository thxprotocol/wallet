<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div v-if="account">
                    Account address:<br />
                    <code>{{ account.address }}</code>
                </div>
                <h2 class="h2">Root Network</h2>
                ETH: {{ rootETH | fromWei }}
                <br />
                ERC20: {{ rootERC20 }}
            </div>
            <div class="col-md-12">
                <h2 class="h2">Child Network</h2>
                ERC20: {{ childERC20 }}
                <br />
                MATIC: {{ childMATIC | fromWei }}
            </div>
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
    </div>
</template>

<script lang="ts">
import { BButton, BFormInput, BInputGroup, BInputGroupAppend, BListGroup } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BurnProof from '@/components/BurnProof.vue';
import { Account, Profile } from '@/store/modules/account';

@Component({
    components: {
        'burn-proof': BurnProof,
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
            const data: Profile = this.account.profile;

            data.burnProof.push(tx.transactionHash);

            await this.$store.dispatch('account/updateProfile', data);
        }
        this.busy.burn = false;
    }
}
</script>
