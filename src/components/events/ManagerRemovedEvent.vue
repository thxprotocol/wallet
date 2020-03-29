<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center p-2">
        <profile-picture class="mr-2" v-if="ev.from" :uid="ev.from.uid" size="sm"/>
        <div class="border-left flex-grow-1 pl-3">
            <div class="d-flex w-100">
                <div class="flex-grow-1">
                    <strong>{{member.firstName}} {{member.lastName}} revoked his Manager role</strong>
                </div>
                <small class="flex-shrink-0">{{ev.blockTime | moment("D/M/'YY HH:mm")}}</small>
            </div>
            <span class="text-muted list-item-text-overflow">
                {{ev.account}}
            </span>
        </div>
    </b-list-group-item>
</template>
<script src="./ManagerRemovedEvent.ts" lang="ts"></script>