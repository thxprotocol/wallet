<template>
    <base-notification :notification="notification" :loading="loading">
        <div slot="notification-content">
            <p class="m-0">
                <strong>{{ notification.account.firstName }}</strong> is requesting membership for pool
                <strong>{{ notification.pool.name }}</strong>
            </p>
        </div>
        <div slot="notification-footer">
            <b-button-group class="w-100">
                <b-button variant="success" @click="grant()">Grant</b-button>
                <b-button variant="danger" @click="decline()">Decline</b-button>
            </b-button-group>
        </div>
    </base-notification>
</template>

<script src="./NotificationMembershipRequest.ts" lang="ts"></script>
