<template>
<article class="region region-container">
    <main class="region region-content">
        <h2>Wallet</h2>
        <div class="alert alert-danger" v-if="error">
            {{error}}
        </div>
        <div class="text-center" v-if="!transactions.length">
            <b-spinner label="Loading..."></b-spinner>
        </div>
        <b-list-group>
            <b-list-group-item
                v-for="(tx, key) in sortedTransactions"
                :key="key"
                :variant="tx.variant">
                <div class="d-flex w-100 justify-content-between">
                    <strong>Transfer {{tx.amount}} THX</strong>
                    <small>{{ tx.created | moment("MMMM Do YYYY HH:mm") }}</small>
                </div>
                <small class="mb-1" v-if="tx.sender">From: {{tx.sender}}</small><br>
                <small class="mb-1" v-if="tx.receiver">To: {{tx.receiver}}</small>
            </b-list-group-item>
        </b-list-group>

    </main>
</article>
</template>

<script src="./Wallet.ts" lang="ts"></script>
