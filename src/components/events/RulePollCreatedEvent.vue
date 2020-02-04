<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center p-2">
        <profile-picture class="mr-2" v-if="ev.from" :uid="ev.from.uid" size="sm"/>
        <div class="border-left flex-grow-1 pl-3" v-if="rule">
            <div class="d-flex w-100">
                <strong class="flex-grow-1">
                    Rule Poll: <i>{{rule.title}}</i>
                    <span class="badge badge-primary ml-1">#{{rule.id}}</span>
                </strong>
                <small class="mb-1">{{ev.blockTime | moment("D/M/'YY HH:mm")}}</small>
            </div>
            <div class="alert alert-warning m-0">
                Proposal: <del v-if="rule.amount">{{rule.amount}} THX</del> → <strong>{{ ev.proposedAmount ? ev.proposedAmount : 0 }} THX</strong>.</div>
        </div>
    </b-list-group-item>
</template>
<script src="./RulePollCreatedEvent.ts" lang="ts"></script>