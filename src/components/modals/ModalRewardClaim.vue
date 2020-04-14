<template>
    <base-modal :id="'modalRewardClaim'" :title="'Claim a reward'" :loading="loading">
        <template slot="content">
            <div class="d-flex justify-content-center">
                <b-button class="mt-3 mb-3" variant="primary" @click="generate()" v-if="!data">Generate QR</b-button>
                <canvas v-show="data" ref="canvas"></canvas>
            </div>

            <pre v-if="data" class="p-2 bg-light">{{ data }}</pre>
        </template>
        <template slot="footer">
            <b-button variant="link" @click="cancel()">Cancel</b-button>
            <b-button variant="danger" :disabled="loading" @click="invalidate()">Invalidate</b-button>
        </template>
    </base-modal>
</template>

<script src="./ModalRewardClaim.ts" lang="ts"></script>
