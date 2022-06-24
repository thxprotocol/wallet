<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <div
            class="mr-auto d-flex align-items-center"
            v-b-tooltip
            :title="`${swaprule.tokenInName} (${ChainId[swaprule.chainId]})`"
        >
            <!-- <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc20.logoURI" class="mr-2" /> -->
            <strong>{{ swaprule.tokenInSymbol }}</strong>
        </div>
        <b-button
            variant="light"
            size="sm"
            @click.stop="$bvModal.show(`modalTransferTokens-${swaprule.tokenInAddress}`)"
        >
            <i class="fas fa-sync ml-0"></i>
        </b-button>
        <base-modal-erc20-swap :swaprule="swaprule" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from './BaseIdenticon.vue';
import { ChainId } from '@/utils/network';
import { ERC20SwapRulePaginated } from '@/store/modules/erc20swaprules';

@Component({
    components: {
        //BaseModalERC20Swap,
        BaseIdenticon,
    },
    computed: mapGetters({}),
})
export default class BaseListGroupItemSwapRule extends Vue {
    ChainId = ChainId;
    @Prop() swaprule!: ERC20SwapRulePaginated;
}
</script>
