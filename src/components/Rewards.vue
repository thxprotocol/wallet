<template>
    <article>

        <BListGroup v-if="rewards && amountOfRewards > 0">
            <Reward
                v-bind:key="reward.id"
                v-for="reward in rewards"
                v-bind:reward="reward"
                v-bind:account="account"
                v-bind:contract="contract"></Reward>
        </BListGroup>

        <div v-if="amountOfRewards == 0" class="alert alert-info">
            <span>This pool currently contains no claimed rewards.</span>
        </div>

        <div v-if="amountOfRewards < 0" class="d-flex w-100 h-100 align-items-center justify-content-center">
            <BSpinner></BSpinner>
        </div>

    </article>
</template>

<script src="./Rewards.ts" lang="ts"></script>