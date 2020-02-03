<template>
    <b-list-group-item v-if="rule">
        <div class="d-flex w-100 justify-content-between">
            <span>Rule Poll Created: <strong>{{ ev.proposedAmount ? ev.proposedAmount : 0 }} THX</strong></span>
            <small>{{ ev.blockTime | moment("MMMM Do YYYY HH:mm") }}</small>
        </div>
        <small class="mb-1">
            Rule #{{ rule.id }}
            <span v-if="rule.title">| {{rule.title}}</span>
            <span v-if="rule.description">: <i>{{rule.description}}</i></span>
        </small>
    </b-list-group-item>
</template>
<script src="./RulePollCreatedEvent.ts" lang="ts"></script>