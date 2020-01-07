<template>
    <b-list-group-item>
        <div class="d-flex w-100 justify-content-between">
            <strong>Deposit: {{amount}} THX</strong>
            <small>{{ ev.created | moment("MMMM Do YYYY HH:mm") }}</small>
        </div>
        <small class="mb-1">{{ev.sender}}</small>
    </b-list-group-item>
</template>
<script src="./Deposit.ts" lang="ts"></script>