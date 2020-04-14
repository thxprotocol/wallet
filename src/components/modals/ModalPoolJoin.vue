<template>
    <base-modal id="ModalPoolJoin" centered title="Join a reward pool" :loading="loading">
        <template slot="content">
            <div class="alert alert-danger" v-if="error">
                {{ error }}
            </div>
            <input
                v-model="input.poolAddress"
                type="text"
                class="form-control"
                placeholder="0x0000000000000000000000000000"
            />
        </template>
        <template slot="footer">
            <b-button variant="link" @click="cancel()">
                Cancel
            </b-button>
            <b-button @click="join()" variant="primary" :disabled="loading">
                Join
            </b-button>
        </template>
    </base-modal>
</template>

<script src="./ModalPoolJoin.ts" lang="ts"></script>
