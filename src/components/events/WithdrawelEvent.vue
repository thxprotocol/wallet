<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center p-2">
        <profile-picture class="mr-2" v-if="ev.from" :uid="ev.from.uid" size="sm"/>
        <div class="border-left flex-grow-1 pl-3">
            <div class="d-flex w-100">
                <span class="flex-grow-1">
                    Withdrawal: <strong>{{ev.amount}} THX</strong>
                </span>
                <small class="flex-shrink-0">{{ev.blockTime | moment("D/M/'YY HH:mm")}}</small>
            </div>
            <span class="text-muted list-item-text-overflow">
                {{ev.beneficiary}}
            </span>
        </div>
    </b-list-group-item>
</template>
<script src="./WithdrawelEvent.ts" lang="ts"></script>
