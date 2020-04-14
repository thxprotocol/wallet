<template>
    <c-modal :id="'modalRewardGive'" :title="'Give a reward'" :loading="loading">
        <template slot="content">
            <input v-model="input.beneficiary" type="text" class="form-control" />
            <small v-if="input.beneficiary === $network.extdev.account" class="text-muted">
                Mind that this is your personal address
            </small>
        </template>
        <template slot="footer">
            <b-button variant="link" @click="cancel()">Cancel</b-button>
            <b-button @click="createReward(rule.id, input.beneficiary)" :disabled="loading" variant="primary">
                Give Reward
            </b-button>
        </template>
    </c-modal>
</template>

<script src="./ModalRewardGive.ts" lang="ts"></script>
