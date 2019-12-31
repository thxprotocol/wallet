<template>
    <article class="region region-container">
        <main class="region region-content">
            <h2>Pools</h2>

            <div class="alert alert-danger" v-if="error">
                {{error}}
            </div>
            
            <b-card
                v-for="p in rewardPools"
                footer-tag="footer"
                header-tag="header"
                tag="article"
                class="mb-2 card-pool">

                <span slot="header" class="font-size-xl text-light">{{p.balance}} THX</span>

                <b-card-text>
                    <span v-if="p.outOfSync" class="badge badge-danger float-right">Out of sync</span>
                    <span v-if="!p.outOfSync" class="badge badge-success float-right">Up to date</span>
                    <strong>{{p.name}}</strong><br>
                    <small>{{p.address}}</small>
                </b-card-text>

                <template slot="footer" class="">
                    <div class="text-right">
                        <button class="btn btn-link card-link" @click="onLeavePool(p.address)">Leave pool</button>
                        <button class="btn btn-link card-link" @click="openPool(p.address)">Open pool</button>
                    </div>
                </template>

            </b-card>

            <p v-if="loading" class="d-flex w-100 justify-content-center">
                <b-spinner></b-spinner>
            </p>

            <button class="btn btn-primary btn-block" @click="showJoinPoolModal = true">
                Add Reward Pool
            </button>

            <modal v-if="showJoinPoolModal" @close="showJoinPoolModal = false">
                <h3 slot="header">Join Reward Pool:</h3>
                <div slot="body">
                    <input v-model="input.poolAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000" />
                </div>
                <template slot="footer">
                    <button @click="onJoinRewardPool()" class="btn btn-primary">Join Pool</button>
                </template>
            </modal>
        </main>
    </article>
</template>

<script src="./Pools.ts" lang="ts"></script>

<style>
.card-pool .card-header {
    background-color: #039be5;
    height: 125px;
    display: flex;
    justify-content: center;
    align-items: center;
}

@media (min-width: 768px) {
    .card-pool .card-header {
        height: 200px;
    }
}

</style>
