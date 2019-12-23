<template>
    <article>
        <Rule
            v-bind:key="rule.id"
            v-for="rule in rules"
            v-bind:rule="rule"
            v-bind:account="account"
            v-bind:contract="contract"></Rule>

        <div class="d-flex w-100 justify-content-end">
            <button v-if="account.isManager" class="btn btn-primary" @click="modal.createRule = true">Add new rule</button>
        </div>

        <Modal v-if="modal.createRule" @close="modal.createRule = false">
            <h3 slot="header">Create reward rule:</h3>
            <div slot="body" v-if="!loading">
                <label for="slug">Slug:</label>
                <input id="slug" v-model="newRule.slug" type="text" class="form-control" placeholder="complete_profile"/>
                <label for="title">Title:</label>
                <input id="title" v-model="newRule.title" type="text" class="form-control" placeholder="Complete your profile!"/>
                <label for="description">Description:</label>
                <textarea class="form-control"  width="100%" rows="3" id="description" v-model="newRule.description" placeholder="When filling all fields of your public profile you will receive the reward."> </textarea>
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="createRule()" v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block">Add new rule</button>
            </template>
        </Modal>

    </article>
</template>

<script src="./Rules.ts"></script>