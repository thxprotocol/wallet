<template>
    <base-notification
        title="Reward Rule Proposal"
        :notification="notification"
        :loading="loading"
        @loading="loading = $event"
    >
        <div slot="notification-content" v-if="!rule.loading">
            <p>
                <strong>{{ notification.account.firstName }}</strong> has started a new Reward Rule Proposal in 
                <strong>{{ notification.pool.name }}</strong>
            </p>
            <blockquote class="blockquote">
                <p>
                    Rule: <strong>#{{ rule.title }}</strong>
                    Current: <strong>#{{ rule.amount }}</strong>
                    Proposal: <strong>#{{ rule.proposedAmount }}</strong>
                </p>
            </blockquote>
        </div>
        <div slot="notification-footer">
            <b-button-group class="w-100">
                <b-button variant="success" @click="approve()">Approve</b-button>
                <b-button variant="danger" @click="decline()">Decline</b-button>
            </b-button-group>
        </div>
    </base-notification>
</template>

<script src="./NotificationRewardRulePoll.ts" lang="ts"></script>
