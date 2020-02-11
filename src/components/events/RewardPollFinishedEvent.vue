<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center p-2">
        <profile-picture class="mr-2" v-if="ev.from" :uid="ev.from.uid" size="sm"/>
        <div v-if="ev.from" class="border-left flex-grow-1 pl-3">
            <div class="d-flex w-100" v-if="reward && !reward.loading">
                <span class="flex-grow-1">
                    <strong> {{ev.from.firstName }}</strong> claims <strong>{{ reward.amount }} THX</strong>
                    <span :class="`badge badge-${ev.approved ? 'success' : 'danger'} ml-1`">
                        {{ev.approved ? 'Approved' : 'Rejected'}}
                    </span>
                </span>
                <small class="flex-shrink-0">{{ev.blockTime | moment("D/M/'YY HH:mm")}}</small>
            </div>
        </div>
    </b-list-group-item>
</template>
<script src="./RewardPollFinishedEvent.ts" lang="ts"></script>
