<template>
    <div>
        <div class="d-flex flex-column h-100">
            <template v-if="payment">
                <div class="flex-grow-1">
                    <b-row v-if="!account && !profile">
                        <b-col md="6">
                            <b-button variant="primary" class="rounded-pill" @click="signin()">
                                Connect THX Account
                            </b-button>
                        </b-col>
                        <b-col md="6" class="text-right">
                            <b-button variant="primary" class="rounded-pill" @click="connect()">
                                Connect Metamask
                            </b-button>
                        </b-col>
                        <b-col md="12">
                            <hr />
                        </b-col>
                    </b-row>
                    <div>
                        <b-alert variant="info" show>
                            <i class="fas fa-info-circle mr-2"></i>
                            The
                            <strong v-b-tooltip :title="payment.receiver">{{ payment.tokenSymbol }} Pool</strong> has
                            send you a payment request.
                        </b-alert>
                        <p class="text-left">
                            <small>Receiver:</small><br />
                            <b-badge
                                :href="`${blockExplorer(payment.chainId)}/address/${payment.receiver}`"
                                target="_blank"
                                variant="primary"
                                class="rounded-pill"
                            >
                                {{ payment.receiver }}
                                <i
                                    v-b-tooltip
                                    title="View details of this account on the block explorer"
                                    class="fas fa-external-link-alt mx-1"
                                ></i>
                            </b-badge>
                        </p>
                        <p class="text-left">
                            <small>Connected:</small><br />
                            <b-badge variant="primary" class="rounded-pill" v-if="!account && !profile">
                                <i class="fas fa-exclamation-circle mx-1"></i>
                                Disconnected
                            </b-badge>
                            <b-badge
                                :href="`${blockExplorer(payment.chainId)}/address/${account}`"
                                target="_blank"
                                variant="primary"
                                class="rounded-pill"
                                v-if="account"
                            >
                                {{ account }}
                                <i
                                    v-b-tooltip
                                    title="View details of this account on the block explorer"
                                    class="fas fa-external-link-alt mx-1"
                                ></i>
                            </b-badge>
                            <b-badge
                                :href="`${blockExplorer(payment.chainId)}/address/${profile.address}`"
                                target="_blank"
                                variant="primary"
                                class="rounded-pill"
                                v-if="profile"
                            >
                                {{ profile.address }}
                                <i
                                    v-b-tooltip
                                    title="View details of this account on the block explorer"
                                    class="fas fa-external-link-alt mx-1"
                                ></i>
                            </b-badge>
                        </p>
                    </div>
                </div>
                <b-button
                    :disabled="!profile && !account"
                    @click="pay()"
                    variant="primary"
                    block
                    class="rounded-pill mb-1"
                >
                    Pay <strong> {{ fromWei(payment.amount, 'ether') }} {{ payment.tokenSymbol }} </strong>
                </b-button>
                <p class="text-muted text-center small m-0">
                    <i class="fas fa-lock mr-1"></i>
                    You only approve for the amount requested and transfers are securely relayed through our relay hub.
                </p>
            </template>
            <div class="flex-grow-1 d-flex align-items-center justify-content-center" v-else>
                <b-spinner variant="primary" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { TNetworks } from '@/store/modules/network';
import { TPayment } from '@/store/modules/payments';
import { getChainInfoForId, NetworkProvider, signCall } from '@/utils/network';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { fromWei } from 'web3-utils';

@Component({
    computed: {
        ...mapState('metamask', ['account', 'chainId']),
        ...mapState('payments', ['payment']),
        ...mapGetters({
            networks: 'network/all',
            profile: 'account/profile',
            privateKey: 'account/privateKey',
            metamask: 'metamask/isConnected',
        }),
    },
})
export default class Payment extends Vue {
    account!: string;
    privateKey!: string;
    chainId!: number;
    networks!: TNetworks;
    payment!: TPayment;
    profile!: UserProfile;
    isConnected!: boolean;
    loading = false;
    fromWei = fromWei;

    blockExplorer = (chainId: number) => getChainInfoForId(chainId).blockExplorer;

    created() {
        this.$store.dispatch('payments/read', {
            paymentId: this.$route.params.id,
            accessToken: this.$route.query.accessToken,
        });
    }

    async signin() {
        const toPath = window.location.href.substring(window.location.origin.length);
        this.$store.dispatch('account/signinRedirect', { toPath });
    }

    async connect() {
        this.$store.dispatch('metamask/checkPreviouslyConnected');

        if (!this.isConnected) {
            await this.$store.dispatch('metamask/connect');
        }

        if (this.chainId !== this.payment.chainId) {
            this.$store.dispatch('metamask/requestSwitchNetwork', this.payment.chainId);
        }
    }

    async pay() {
        let data;

        if (this.account) data = await this.payWithMetamask();
        if (this.profile) data = await this.payDefault();

        this.loading = true;

        try {
            await this.$store.dispatch('payments/pay', data);

            // TODO Start polling
            await this.$store.dispatch('payments/read', {
                paymentId: this.payment._id,
                accessToken: this.payment.token,
            });

            if (this.payment.state === 1) {
                window.location.href = this.payment.successUrl;
            }
        } catch (error) {
            console.log(error);
            debugger;
            // window.location.href = this.payment.failUrl;
        } finally {
            this.loading = false;
        }
    }

    async payDefault() {
        const npid = this.payment.chainId === 31337 ? NetworkProvider.Main : this.payment.chainId; // TODO this is only here for testing purposes. Move to chainId usage soon
        const web3 = this.networks[npid as NetworkProvider];
        const { call, nonce, sig } = await signCall(
            web3,
            this.payment.receiver,
            'topup',
            [this.payment.amount],
            this.privateKey,
        );

        await this.$store.dispatch('network/approve', {
            chainId: this.payment.chainId,
            poolAddress: this.payment.receiver,
            amount: this.payment.amount,
            tokenAddress: this.payment.tokenAddress,
        });

        return { call, nonce, sig };
    }

    async payWithMetamask() {
        const { call, nonce, sig } = await this.$store.dispatch('metamask/sign', {
            poolAddress: this.payment.receiver,
            method: 'topup',
            params: [this.payment.amount],
        });

        await this.$store.dispatch('metamask/approve', {
            amount: this.payment.amount,
            spender: this.payment.receiver,
            tokenAddress: this.payment.tokenAddress,
        });

        return { call, nonce, sig };
    }
}
</script>
