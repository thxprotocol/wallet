<template>
    <base-modal
        id="modalMembershipRequest"
        title="Request Membership"
        @reset="error = ''"
        :error="error"
        :loading="loading"
    >
        <template slot="content">
            <label>Provide a message (optional):</label>
            <textarea v-model="input" class="form-control"> </textarea>
        </template>
        <template slot="footer">
            <b-button variant="link" @click="cancel()">Cancel</b-button>
            <b-button variant="primary" :disabled="loading" @click="request()"> Request</b-button>
        </template>
    </base-modal>
</template>

<script src="./ModalMembershipRequest.ts" lang="ts"></script>
