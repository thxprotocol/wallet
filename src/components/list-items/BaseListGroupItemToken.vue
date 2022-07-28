<template>
    <b-list-group-item v-if="erc20" class="d-flex justify-content-between align-items-center">
        <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="`${erc20.name} (${ChainId[erc20.chainId]})`">
            <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc20.logoURI" class="mr-2" />
            <strong>{{ erc20.symbol }}</strong>
        </div>
        <div class="h3 mr-3 m-0">
            {{ erc20.balance }}
        </div>
        <b-button variant="light" size="sm" @click.stop="$bvModal.show(`modalTransferTokens-${erc20.address}`)">
            <i class="fas fa-exchange-alt ml-0"></i>
        </b-button>
        <base-modal-transfer-tokens :erc20="erc20" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { UserProfile } from '@/store/modules/account';
import { ERC20 } from '@/store/modules/erc20';
import BaseModalTransferTokens from '@/components/modals/ModalTransferTokens.vue';
import BaseIdenticon from '../BaseIdenticon.vue';
import { ChainId } from '@/types/enums/ChainId';

@Component({
    components: {
        BaseModalTransferTokens,
        BaseIdenticon,
    },
})
export default class BaseListGroupItemToken extends Vue {
    ChainId = ChainId;
    profile!: UserProfile;

    @Prop() erc20!: ERC20;

    mounted() {
        this.$store.dispatch('erc20/balanceOf', this.erc20);
    }
}
</script>
