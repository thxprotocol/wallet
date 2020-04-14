<template>
    <b-card tag="article" footer-tag="footer">
        <b-overlay :show="loading" no-wrap></b-overlay>
        <div class="d-flex align-items-center mb-3">
            <profile-picture :uid="notification.account.uid" size="sm" class="mr-3" />
            <div>
                <h2 class="m-0 h4">{{ notification.title }}</h2>
                <small class="text-muted">
                    {{ notification.timestamp | moment("DD/MM/'YY HH:mm") }} {{ notification.key }}
                </small>
            </div>
        </div>

        <slot name="notification-content"></slot>

        <div slot="footer">
            <slot name="notification-footer"></slot>
        </div>
    </b-card>
</template>

<script src="./BaseNotification.ts" lang="ts"></script>
