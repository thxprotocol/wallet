<template>
    <b-card v-if="!loading" tag="article" footer-tag="footer">
        <div class="d-flex align-items-center mb-3">
            <profile-picture :uid="notification.account.uid" size="sm" class="mr-3" />
            <div>
                <h2 class="m-0 h4">{{ notification.title }}</h2>
                <small class="text-muted">{{ notification.timestamp | moment("DD/MM/'YY HH:mm") }}</small>
            </div>
        </div>

        <p class="m-0">
            <strong>{{ notification.account.firstName }}</strong> is requesting membership for pool
            <strong>{{ notification.pool.name }}</strong>
        </p>

        <div slot="footer">
            <b-button-group class="w-100">
                <b-button variant="success">Grant</b-button>
                <b-button variant="danger">Decline</b-button>
            </b-button-group>
        </div>
    </b-card>
</template>

<script src="./Notification.ts" lang="ts"></script>
