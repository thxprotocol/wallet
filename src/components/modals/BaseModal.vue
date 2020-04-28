<template>
    <b-modal :id="id" :title="title" centered @hidden="$emit('reset')">
        <b-alert variant="danger" dismissible show v-if="error" @dismissed="$emit('reset')">{{ error }}</b-alert>
        <slot name="content"> </slot>
        <template v-slot:modal-footer="{ ok, cancel }">
            <b-overlay :show="loading" no-wrap></b-overlay>
            <slot name="footer"> </slot>
        </template>
    </b-modal>
</template>

<script src="./BaseModal.ts" lang="ts"></script>
