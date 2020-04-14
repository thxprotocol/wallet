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

            <b-button variant="primary" class="btn-block" v-b-modal.modalPoolJoin>
                Join Reward Pool
            </b-button>
            <b-button variant="link" class="btn-block" v-b-modal.modalPoolCreate>
                Create Reward Pool
            </b-button>

            <modal-pool-join />
            <modal-pool-create />
        </main>
    </article>
</template>

<script src="./Pools.ts" lang="ts"></script>
