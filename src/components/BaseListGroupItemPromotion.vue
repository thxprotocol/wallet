<template>
    <b-list-group-item class="d-flex align-items-center w-100">
        <div class="mr-3">
            <i class="fas fa-tags text-muted"></i>
        </div>
        <div class="mr-auto">
            <strong>{{ promotion.title }}</strong>
            <br />
            {{ promotion.description }}
        </div>

        <b-alert v-if="promotion.value" class="m-0 mr-3" show variant="warning">{{ promotion.value }}</b-alert>
        <b-button
            v-if="membership && !promotion.value"
            variant="primary"
            :disabled="error || busy"
            v-b-modal="`modalDepositPool-${membership.id}`"
        >
            Pay <strong>{{ promotion.price }} {{ membership.token.symbol }}</strong>
        </b-button>
        <base-modal-deposit-pool :item="promotion.id" :amount="promotion.price" :membership="membership" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { Membership } from '@/store/modules/memberships';
import { format } from 'date-fns';
import { TPromoCode } from '@/store/modules/promocodes';
import BaseModalDepositPool from '@/components/modals/ModalDepositPool.vue';

@Component({
    components: {
        'base-modal-deposit-pool': BaseModalDepositPool,
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
}
</script>
