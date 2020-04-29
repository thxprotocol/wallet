<template>
    <base-notification
        title="Reward Rule Proposal"
        :notification="notification"
        :loading="loading"
        @loading="loading = $event"
    >
        <div slot="notification-content" v-if="rewardRule">
            <p>
                <strong>{{ notification.account.firstName }} {{ notification.account.lastName }}</strong> proposed a new
                reward rule size.
            </p>
            <blockquote class="blockquote">
                <p>
                    Pool: <strong>{{ notification.pool.name }}</strong>
                    <br />
                    Rule: <strong>{{ rewardRule.title }} ({{ rewardRule.id }})</strong>
                    <br />

                    Proposal:
                    <strong>
                        <del>{{ rewardRule.amount }} THX</del> &#x2192; {{ notification.metadata.proposedAmount }} THX
                    </strong>
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
            <b-button-group class="w-100" v-if="rewardRule && rewardRule.poll && now < rewardRule.poll.endTime">
                <b-button variant="success" @click="approve()">Approve</b-button>
                <b-button variant="danger" @click="decline()">Decline</b-button>
            </b-button-group>
            <b-alert variant="info" v-else show class="m-0">
                This poll has ended and voting is no longer possible.
            </b-alert>
        </div>
    </base-notification>
</template>

<script src="./NotificationRewardRulePoll.ts" lang="ts"></script>
