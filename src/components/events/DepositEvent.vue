<template>
    <b-list-group-item>
        <div class="d-flex w-100 justify-content-between">
            <span>Deposit: <strong>{{ev.amount}} THX</strong></span>
            <small>{{ ev.blockTime | moment("MMMM Do YYYY HH:mm") }}</small>
        </div>
        <small class="mb-1">{{ev.sender}}</small>
    </b-list-group-item>
</template>
<script src="./DepositEvent.ts" lang="ts"></script>