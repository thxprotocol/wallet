<template>
<article class="region region-container">
    <main class="region region-content">
        <h2>Wallet</h2>

        <div class="text-center" v-if="!loading">
            <b-spinner label="Loading..."></b-spinner>
        </div>
        {{orderedTokenTransfers}}
        <b-list-group v-if="orderedTokenTransfers">
            <b-list-group-item
                v-bind:key="transfer.hash"
                v-for="transfer in orderedTokenTransfers"
                variant="transfer.variant">
                <div class="d-flex w-100 justify-content-between">
                    <strong>Transfer {{transfer.amount}} THX</strong>
                    <small>{{ transfer.timestamp | moment("MMMM Do YYYY HH:mm") }}</small>
                </div>
                <small class="mb-1">From: {{transfer.from}}</small><br>
                <small class="mb-1">To: {{transfer.to}}</small>
            </b-list-group-item>
        </b-list-group>

    </main>
</article>
</template>

<script src="./Wallet.ts" lang="ts"></script>
