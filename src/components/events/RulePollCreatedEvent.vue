<template>
    <b-list-group-item v-if="rule">
        <div class="d-flex w-100 justify-content-between">
            <span>Rule State Changed: <strong>{{ rule.state }}</strong></span>
            <small>{{ rule.blockTime | moment("MMMM Do YYYY HH:mm") }}</small>
        </div>
        <small v-if="rule.title && rule.description" class="mb-1">
            {{rule.title}}: <i>{{rule.description}}</i>
        </small>
    </b-list-group-item>
</template>
<script src="./RuleStateChangedEvent.ts" lang="ts"></script>