<template>
    <b-modal :id="id" :title="title" centered>
        <b-overlay :show="loading" no-wrap></b-overlay>
        <slot name="content"> </slot>
        <template v-slot:modal-footer="{ ok, cancel }">
            <slot name="footer"> </slot>
        </template>
    </b-modal>
</template>

<script src="./Modal.ts" lang="ts"></script>
