<template>
    <base-notification :notification="notification" :loading="loading" @loading="loading = $event">
        <div slot="notification-content">
            <p class="m-0">
                <strong>{{ notification.account.firstName }}</strong> is claiming a reward for pool
                <strong>{{ notification.pool.name }}</strong>
            </p>
            <p>
                {{ notification.metadata }}
            </p>
        </div>
        <div slot="notification-footer">
            <b-button-group class="w-100">
                <b-button variant="success" @click="approve()">Approve</b-button>
                <b-button variant="danger" @click="decline()">Decline</b-button>
            </b-button-group>
        </div>
    </base-notification>
</template>

<script src="./NotificationRewardApprove.ts" lang="ts"></script>
