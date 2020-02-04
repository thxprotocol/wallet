<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center p-2">
        <profile-picture class="mr-2" v-if="ev.from" :uid="ev.from.uid" size="sm"/>
        <div class="border-left flex-grow-1 pl-3">
            <div class="d-flex w-100">
                <strong class="flex-grow-1">
                    Member Added
                </strong>
                <small class="mb-1">{{ev.blockTime | moment("D/M/'YY HH:mm")}}</small>
            </div>
            <span class="text-muted list-item-text-overflow">
                {{ev.account}}
            </span>
        </div>
    </b-list-group-item>
</template>
<script src="./MemberAddedEvent.ts" lang="ts"></script>