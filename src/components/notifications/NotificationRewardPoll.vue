<template>
    <base-notification
        title="Reward Claimed"
        :notification="notification"
        :loading="reward && reward.loading"
        @loading="loading = $event"
    >
        <div slot="notification-content" v-if="reward && !reward.loading">
            <b-alert variant="warning" show v-if="!isMember">
                The beneficiary is not a member. <a class="text-primary" @click="invite()">Grant membership now</a>.
            </b-alert>
            <b-alert variant="warning">
                The beneficiary is not a member. <a class="text-primary" @click="invite()">Grant membership now</a>.
            </b-alert>
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
            <base-poll @start="$timer.start('update')" :now="now" :poll="reward" />
        </div>
        <div slot="notification-footer" v-if="reward && !reward.loading">
            <b-button-group class="w-100" v-if="now < reward.endTime">
                <b-button variant="success" @click="approve()">Approve</b-button>
                <b-button variant="danger" @click="decline()">Decline</b-button>
            </b-button-group>
            <b-alert variant="info" v-else show class="m-0">
                This poll has ended and voting is no longer possible.
            </b-alert>
        </div>
    </base-notification>
</template>

<script src="./NotificationRewardPoll.ts" lang="ts"></script>
