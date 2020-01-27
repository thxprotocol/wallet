<template>
    <b-list-group-item v-if="rule">
        <div class="d-flex w-100 justify-content-between">
            <span>Rule Poll Finished: <strong>{{ ev.approved ? 'Approved' : 'Rejected'}}</strong></span>
            <small>{{ ev.blockTime | moment("MMMM Do YYYY HH:mm") }}</small>
        </div>
        <small class="mb-1">
            Rule #{{ rule.id }}
            <span v-if="rule.title">| {{rule.title}}</span>
            <span v-if="rule.description">: <i>{{rule.description}}</i></span>
        </small>
    </b-list-group-item>
</template>
<script src="./RulePollFinishedEvent.ts" lang="ts"></script>