<template>
<article class="region region-container overflow p-3">

    <div
        class="pb-2 w-100"
        v-for="(ev, key) in events">

        <rule
            :key="key"
            v-if="ev.rule"
            :rule="ev.rule"
            :pool="ev.pool"
            :isManager="isManager"
            :isMember="isMember" />

        <reward
            :key="key"
            v-if="ev.reward && ev.reward.state === 'Pending' && isManager"
            :reward="ev.reward"
            :pool="ev.pool"
            :isManager="isManager"
            :isMember="isMember" />

    </div>

</article>
</template>

<script src="./Notifications.ts" lang="ts"></script>
