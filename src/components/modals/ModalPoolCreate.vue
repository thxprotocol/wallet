<template>
    <c-modal id="ModalPoolCreate" centered title="Create a reward pool" :loading="loading">
        <template slot="content">
            <div class="alert alert-danger" v-if="error">
                {{ error }}
            </div>
            <input v-model="input.poolName" type="text" class="form-control" placeholder="Volunteers united" />
        </template>
        <template slot="footer">
            <b-button variant="link" @click="cancel()">
                Cancel
            </b-button>
            <b-button @click="create()" variant="primary" :disabled="loading">
                Create
            </b-button>
        </template>
    </c-modal>
</template>

<script src="./ModalPoolCreate.ts" lang="ts"></script>
