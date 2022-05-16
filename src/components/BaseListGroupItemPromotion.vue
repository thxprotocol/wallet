<template>
    <b-list-group-item>
        <div class="d-flex align-items-center w-100 ">
            <div class="mr-3">
                <i class="fas fa-tags text-muted"></i>
            </div>
            <div class="mr-auto">
                <strong>{{ promotion.title }}</strong>
                <br />
                <p>
                    {{ promotion.description }}
                </p>
            </div>
        </div>
        <div class="text-center">
            <b-button
                v-if="membership && !promotion.value && erc20"
                variant="primary"
                :disabled="error || busy"
                v-b-modal="`modalDepositPool-${promotion.id}`"
            >
                Pay <strong>{{ promotion.price }} {{ erc20.symbol }}</strong>
            </b-button>
        </div>
        <template v-if="promotion.value">
            <b-alert class="w-100 m-0 mr-3" show variant="warning">
                <strong>Promotion unlocked:</strong><br />
                {{ promotion.value }}
            </b-alert>
        </template>
        <base-modal-redeem-promotion :erc20="erc20" :promotion="promotion" :membership="membership" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { Membership } from '@/store/modules/memberships';
import { format } from 'date-fns';
import { TPromoCode } from '@/store/modules/promocodes';
import BaseModalRedeemPromotion from '@/components/modals/ModalRedeemPromotion.vue';
import { ERC20 } from '@/store/modules/erc20';

@Component({
    components: {
        BaseModalRedeemPromotion,
    },
    computed: mapGetters({
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        memberships: 'memberships/all',
        withdrawals: 'withdrawals/all',
    }),
})
export default class BaseListGroupItemWithdrawal extends Vue {
    busy = false;
    error = '';
    format = format;

    // getters
    profile!: UserProfile;

    @Prop() promotion!: TPromoCode;
    @Prop() membership!: Membership;
    @Prop() erc20!: ERC20;
}
</script>
