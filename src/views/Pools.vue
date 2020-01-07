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
                        <button class="btn btn-link card-link" @click="$router.replace(`/pools/${p.address}`)">Open pool</button>
                    </div>
                </template>

            </b-card>

            <p v-if="loading" class="d-flex w-100 justify-content-center">
                <b-spinner></b-spinner>
            </p>

            <button class="btn btn-primary btn-block" @click="$refs.modalJoinPool.show()">
                Add Reward Pool
            </button>

            <b-modal ref="modalJoinPool" centered title="Join a reward pool">
                <p v-if="loading" class="d-flex w-100 justify-content-center">
                    <b-spinner></b-spinner>
                </p>
                <input v-if="!loading" v-model="input.poolAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000" />
                <template v-slot:modal-footer="{ ok, cancel }">
                    <button class="btn btn-link" @click="$refs.modalDeposit.hide()">
                        Cancel
                    </button>
                    <button @click="onJoinRewardPool()" v-bind:class="{ disabled: loading }" class="btn btn-primary">
                        Join
                    </button>
                </template>
            </b-modal>
        </main>
    </article>
</template>

<script src="./Pools.ts" lang="ts"></script>