<template>
    <article class="region region-container">
        <main class="region region-content">
            <h2>Pools</h2>

            <div class="alert alert-danger" v-if="error">
                {{ error }}
            </div>

            <b-card
                v-for="(p, key) in rewardPools"
                :key="key"
                footer-tag="footer"
                header-tag="header"
                tag="article"
                class="mb-2 card-pool"
            >
                <div slot="header" class="font-size-xl text-light">{{ p.balance }} THX</div>

                <b-card-text>
                    <strong> {{ p.name }} </strong><br />
                    <small
                        >{{ p.address }}
                        <a class="text-primary" @click="copyClipboard(p.address)">
                            ({{ clipboard === p.address ? 'Copied!' : 'Copy' }})
                        </a>
                    </small>
                </b-card-text>

                <template slot="footer">
                    <div class="text-right">
                        <button class="btn btn-link card-link" @click="leaveRewardPool(p.address)">Leave pool</button>
                        <button class="btn btn-link card-link" @click="$router.replace(`/pools/${p.address}`)">
                            Open pool
                        </button>
                    </div>
                </template>
            </b-card>

            <b-button variant="primary" class="btn-block" @click="$refs.modalJoinPool.show()">
                Join Reward Pool
            </b-button>
            <b-button variant="link" class="btn-block" @click="$refs.modalCreatePool.show()">
                Create Reward Pool
            </b-button>

            <b-modal ref="modalJoinPool" centered title="Join a reward pool">
                <input
                    v-model="input.poolAddress"
                    type="text"
                    class="form-control"
                    placeholder="0x0000000000000000000000000000"
                />
                <template v-slot:modal-footer>
                    <b-overlay :show="loading" no-wrap></b-overlay>
                    <b-button variant="link" @click="$refs.modalJoinPool.hide()">
                        Cancel
                    </b-button>
                    <b-button @click="joinRewardPool(input.poolAddress)" variant="primary" :disabled="loading">
                        Join
                    </b-button>
                </template>
            </b-modal>

            <b-modal ref="modalCreatePool" centered title="Create a reward pool">
                <input v-model="input.poolName" type="text" class="form-control" placeholder="Volunteers united" />
                <template v-slot:modal-footer>
                    <b-overlay :show="loading" no-wrap></b-overlay>

                    <b-button variant="link" @click="$refs.modalCreatePool.hide()">
                        Cancel
                    </b-button>
                    <b-button @click="createRewardPool(input.poolName)" variant="primary" :disabled="loading">
                        Create
                    </b-button>
                </template>
            </b-modal>
        </main>
    </article>
</template>

<script src="./Pools.ts" lang="ts"></script>
