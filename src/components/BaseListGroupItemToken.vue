<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <div
            class="mr-auto d-flex align-items-center"
            v-b-tooltip
            :title="`${erc20.name} (${NetworkProvider[erc20.network]})`"
        >
            <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc20.logoURI" class="mr-2" />
            <strong>{{ erc20.symbol }}</strong>
        </div>
        <div class="h3 mr-3 m-0">
            {{ erc20.balance }}
        </div>
        <b-button variant="light" size="sm" @click.stop="$bvModal.show(`modalTransferTokens-${erc20.address}`)">
            <i class="fas fa-exchange-alt ml-0"></i>
        </b-button>
        <base-modal-transfer-tokens :token="erc20" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ERC20 } from '@/store/modules/erc20';
import { NetworkProvider } from '@/utils/network';
import BaseModalTransferTokens from '@/components/modals/ModalTransferTokens.vue';
import BaseIdenticon from './BaseIdenticon.vue';

@Component({
    components: {
        BaseModalTransferTokens,
        BaseIdenticon,
    },
})
export default class BaseListGroupItemToken extends Vue {
    NetworkProvider = NetworkProvider;

    @Prop() erc20!: ERC20;
}
</script>
