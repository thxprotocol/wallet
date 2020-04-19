<template>
    <base-notification
        title="Reward Claimed"
        :notification="notification"
        :loading="loading"
        @loading="loading = $event"
    >
        <div slot="notification-content" v-if="reward && !reward.loading">
            <p>
                <strong>{{ notification.account.firstName }}</strong> is claiming a reward in
                <strong>{{ notification.pool.name }}</strong>
            </p>
            <blockquote class="blockquote">
                <p>
                    Reward: <strong>{{ reward.amount }} THX</strong><br />
                    Rule: <strong>#{{ reward.rule }}</strong>
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

<script src="./NotificationRewardPoll.ts" lang="ts"></script>
