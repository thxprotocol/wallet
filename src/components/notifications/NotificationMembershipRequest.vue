<template>
    <base-notification
        title="Membership Requested"
        :notification="notification"
        :loading="loading"
        @loading="loading = $event"
    >
        <div slot="notification-content">
            <p>
                {{ notification.metadata.message }}
            </p>
            <blockquote class="blockquote">
                First name: <strong>{{ notification.account.firstName }}</strong>
                <br />
                Last name: <strong>{{ notification.account.lastName }}</strong>
                <br />
                E-mail: <strong>{{ notification.account.email }}</strong>
                <br />
                Pool: <strong>{{ notification.pool.name }}</strong>
            </blockquote>
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
