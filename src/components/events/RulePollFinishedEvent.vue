<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center p-2">
        <profile-picture class="mr-2" v-if="ev.from" :uid="ev.from.uid" size="sm"/>
        <div class="border-left flex-grow-1 pl-3" v-if="rule">
            <div class="d-flex w-100">
                <span class="flex-grow-1">
                    <strong>{{rule.title}}</strong>
                    <span v-if="ev.approved" class="badge badge-success ml-1">
                        Approved
                    </span>
                    <span v-if="!ev.approved" class="badge badge-danger ml-1">
                        Rejected
                    </span>
                </span>
                <small class="flex-shrink-0">{{ev.blockTime | moment("D/M/'YY HH:mm")}}</small>
            </div>
            <small v-if="ev.approved" class="text-muted">
                Rule changed to <strong>{{ rule.amount }} THX</strong>.
            </small>
        </div>
    </b-list-group-item>
</template>
<script src="./RulePollFinishedEvent.ts" lang="ts"></script>
