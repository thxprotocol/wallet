<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center p-2">
        <profile-picture class="mr-2" v-if="ev.from" :uid="ev.from.uid" size="sm" />
        <div class="border-left flex-grow-1 pl-3">
            <div class="d-flex w-100">
                <div class="flex-grow-1">
                    <span v-if="member"
                        ><strong>{{ member.firstName }} {{ member.lastName }}</strong> joined!</span
                    >
                    <span v-else><strong>Unknown User</strong> joined</span>
                </div>
                <small class="flex-shrink-0">{{ ev.blockTime | moment("D/M/'YY HH:mm") }}</small>
            </div>
            <small class="text-muted list-item-text-overflow">
                {{ ev.account }}
            </small>
        </div>
    </b-list-group-item>
</template>
<script src="./MemberAddedEvent.ts" lang="ts"></script>
