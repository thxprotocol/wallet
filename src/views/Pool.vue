<template>
    <div class="h-100 w-100">
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-if="!busy && membership">
            <b-jumbotron bg-variant="primary" text-variant="dark">
                <div class="container">
                    <h1 class="display-4">
                        <strong class="font-weight-bold">
                            {{ membership.poolToken.balance.hex | fromBigNumber }}
                        </strong>
                        {{ membership.poolToken.symbol }}
                    </h1>
                </div>
            </b-jumbotron>
            <div class="container mt-3">
                <b-alert show dismissable variant="danger" v-if="error">
                    {{ error }}
                </b-alert>
                <b-list-group class="mb-3" v-if="hasWithdrawals">
                    <b-list-group-item
                        class="d-flex align-items-center w-100"
                        :key="key"
                        v-for="(withdrawal, key) of withdrawals[this.$route.params.address]"
                    >
                        <strong class="font-weight-bold mr-auto">
                            {{ withdrawal.amount.hex | fromBigNumber }} {{ membership.poolToken.symbol }}
                        </strong>
                        <b-button variant="primary" @click="withdraw(withdrawal)">
                            Withdraw
                        </b-button>
                    </b-list-group-item>
                </b-list-group>
                <b-alert variant="info" show class="mb-3" v-else>
                    You have no open withdrawals for this pool.
                </b-alert>
                <b-button block variant="secondary" to="/account">
                    Back
                </b-button>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BAlert, BButton, BJumbotron, BListGroup, BListGroupItem, BSpinner } from 'bootstrap-vue';
import { IMemberships } from '@/store/modules/memberships';
import { UserProfile } from '@/store/modules/account';
import { IWithdrawals, Withdrawal } from '@/store/modules/withdrawals';
import { Wallet } from 'ethers';

@Component({
    name: 'PoolView',
    components: {
        'b-jumbotron': BJumbotron,
        'b-alert': BAlert,
        'b-button': BButton,
        'b-spinner': BSpinner,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
        withdrawals: 'withdrawals/all',
        wallet: 'network/wallet',
        privateKey: 'account/privateKey',
    }),
})
export default class PoolView extends Vue {
    busy = false;
    error = '';

    // getters
    memberships!: IMemberships;
    withdrawals!: IWithdrawals;
    profile!: UserProfile;
    wallet!: Wallet;
    privateKey!: string;

    get hasWithdrawals() {
        return (
            this.withdrawals &&
            this.withdrawals[this.$route.params.address] &&
            Object.values(this.withdrawals[this.$route.params.address]).length
        );
    }

    get membership() {
        return this.memberships[this.$route.params.address];
    }

    async withdraw(withdrawal: Withdrawal) {
        try {
            await this.$store.dispatch('network/signCall', {
                poolAddress: this.$route.params.address,
                name: 'withdrawPollFinalize',
                args: [withdrawal.id],
                signer: this.wallet,
            });

            this.$store.commit('withdrawals/remove', withdrawal);
        } catch (e) {
            this.error = 'Error: Signed withdraw call reverted.';
        }
    }

    async mounted() {
        this.busy = true;

        try {
            if (!this.profile) {
                await this.$store.dispatch('account/getProfile');
            }
            if (!this.wallet) {
                this.$store.commit('network/connect', this.privateKey);
            }
            if (!this.membership) {
                await this.$store.dispatch('memberships/read', {
                    profile: this.profile,
                    poolAddress: this.$route.params.address,
                });
            }

            await this.$store.dispatch('withdrawals/init', {
                profile: this.profile,
                poolAddress: this.$route.params.address,
            });
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
