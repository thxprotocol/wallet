<template>
    <base-modal
        :id="'modalRulePollCreate'"
        @reset="error = ''"
        :error="error"
        :title="'Create Rule Poll'"
        :loading="loading"
    >
        <template slot="content">
            <p>
                Propose a new reward size for this rule. A poll will be started and members of the pool can vote to
                approve or reject your proposal.
            </p>
            <input v-model="input.proposal" type="number" class="form-control" />
        </template>
        <template slot="footer">
            <b-button variant="link" @click="cancel()">Cancel</b-button>
            <b-button @click="startRulePoll()" :disabled="loading" variant="primary">
                Create Poll
            </b-button>
        </template>
    </base-modal>
</template>

<script src="./ModalRulePollCreate.ts" lang="ts"></script>
