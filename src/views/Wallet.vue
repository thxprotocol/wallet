<template>
    <article class="region region-container">
        <main class="region region-content">
            <h2>My Pool Transfers</h2>
            <div class="alert alert-danger" v-if="error">
                {{ error }}
            </div>
            <div class="text-center" v-if="!allPoolTransactions.length">
                <b-spinner label="Loading..."></b-spinner>
            </div>
            <b-list-group>
                <b-list-group-item v-for="(tx, key) in sortedTransactions" :key="key" :variant="tx.variant">
                    <div class="d-flex w-100 justify-content-between">
                        <strong>{{ tx.sender ? 'Deposit ' : 'Withdraw ' }}{{ tx.amount }} THX</strong>
                        <small>{{ tx.created | moment('MMMM Do YYYY HH:mm') }}</small>
                    </div>
                    <small class="d-flex">
                        <span class="mr-1">{{ tx.pool.name }}</span>
                        <span class="d-flex text-muted">
                            (<span class="list-item-text-overflow">{{ tx.pool.address }}</span
                            >)
                        </span>
                    </small>
                </b-list-group-item>
            </b-list-group>
        </main>
    </article>
</template>

<script src="./Wallet.ts" lang="ts"></script>
