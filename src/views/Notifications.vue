<template>
<article class="region region-container overflow p-3 d-block">

    <div class="alert alert-warning" v-if="events.length === 0">
        Currently found {{events.length}} events.
    </div>

    <div
        class="pb-2 w-100"
        v-for="(ev, key) in events">
        {{ev.state}}
        <rule
            :key="key"
            v-if="ev.rule"
            :rule="ev.rule"
            :pool="ev.pool" />

        <reward
            v-if="ev.reward && ev.reward.state === 'Pending'"
            :key="key"
            :reward="ev.reward"
            :pool="ev.pool" />

    </div>

</article>
</template>

<script src="./Notifications.ts" lang="ts"></script>
