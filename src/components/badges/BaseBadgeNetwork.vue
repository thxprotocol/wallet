<template>
    <b-badge
        v-if="chainInfo"
        v-b-tooltip
        :title="version"
        class="p-2 text-white d-flex-inline align-items-center"
        variant="dark"
    >
        <img :src="chainInfo.logo" class="mr-1" width="auto" height="12" />
        {{ chainInfo.name }}
    </b-badge>
</template>

<script lang="ts">
import { ChainInfo } from '@/types/ChainInfo';
import { ChainId } from '@/types/enums/ChainId';
import { chainInfo } from '@/utils/chains';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseBadgeNetwork extends Vue {
    chainInfo: ChainInfo | null = null;

    @Prop() chainId!: ChainId;
    @Prop() version!: string;

    mounted() {
        this.chainInfo = chainInfo[this.chainId];
    }
}
</script>
