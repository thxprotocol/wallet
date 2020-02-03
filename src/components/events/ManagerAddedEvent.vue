<template>
    <b-list-group-item>
        <div class="d-flex w-100 justify-content-between">
            <strong>Manager Added</strong>
            <small>{{ ev.blockTime | moment("MMMM Do YYYY HH:mm") }}</small>
        </div>
        <small class="mb-1">{{ev.account}}</small>
    </b-list-group-item>
</template>
<script src="./ManagerAddedEvent.ts" lang="ts"></script>