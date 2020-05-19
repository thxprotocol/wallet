<template>
    <b-card tag="article" footer-tag="footer">
        <b-overlay :show="loading" no-wrap></b-overlay>
        <div class="d-flex align-items-center mb-3">
            <profile-picture :uid="notification.account.uid" size="sm" class="mr-3" />
            <div class="flex-grow-1">
                <h2 class="m-0 h4">{{ title }}</h2>
                <small class="text-muted">
                    {{ notification.metadata.timestamp | moment("DD/MM/'YY HH:mm") }}
                </small>
            </div>
            <button @click="remove()" class="btn btn-light">
                <span class="close">×</span>
            </button>
        </div>

        <slot name="notification-content"></slot>

        <div slot="footer">
            <slot name="notification-footer"></slot>
        </div>
    </b-card>
</template>

<script src="./BaseNotification.ts" lang="ts"></script>
