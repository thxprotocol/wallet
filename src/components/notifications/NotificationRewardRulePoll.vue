<template>
    <base-notification
        title="Reward Rule Proposal"
        :notification="notification"
        :loading="loading"
        @loading="loading = $event"
    >
        <div slot="notification-content" v-if="rewardRule">
            <blockquote class="blockquote">
                <p>
                    Pool: <strong>{{ notification.pool.name }}</strong>
                    <br />
                    Rule: <strong>{{ rewardRule.title }} ({{ rewardRule.id }})</strong>
                    <br />
                    Amount: <strong>#{{ rewardRule.amount }}</strong>
                    <br />
                    Proposal: <strong>{{ notification.metadata.proposedAmount }}</strong>
                    <br />
                    By: <strong>{{ notification.account.firstName }} {{ notification.account.lastName }}</strong>
                </p>
            </blockquote>
            <base-poll
                v-if="rewardRule && rewardRule.poll"
                @start="$timer.start('update')"
                :now="now"
                :poll="rewardRule.poll"
            />
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
