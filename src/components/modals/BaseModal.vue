<template>
    <b-modal :id="id" :title="title" centered @hidden="$emit('error', '')">
        <b-overlay :show="loading" no-wrap></b-overlay>
        <b-alert variant="danger" dismissible :show="error !== ''" @dismissed="$emit('error', '')">{{ error }}</b-alert>
        <slot name="content"> </slot>
        <template v-slot:modal-footer="{ ok, cancel }">
            <slot name="footer"> </slot>
        </template>
    </b-modal>
</template>

<script src="./BaseModal.ts" lang="ts"></script>
