<template>
<article class="region region--container">
    <button v-on:click="close()" class="btn btn--close">Close</button>

    <div class="list list--swipe" v-if="rewards">
        <div class="splash">
            <img width="100%" height="auto" v-bind:src="assets.stars" alt="Flash Page Stars" />
            <h1 class="font-size-xl">+ {{ reward.amount }}</h1>
            <p><strong class="font-size-large">THX</strong></p>
            <hr />
            <p>{{ pool.name }}</p>
            <p>for<br />
                <strong>{{ reward.slug }}</strong></p>
        </div>
    </div>

    <ul class="list list--nav">
        <li v-bind:key="r.id" v-for="r in rewards">
            <button v-on:click="navigateToReward(r.id)" v-bind:class="`${(r.id == currentReward) ? 'active' : ''}`">{{ r.id }}</button>
        </li>
    </ul>

</article>
</template>

<script>
import StarsSrc from '../assets/flash_page_stars.svg';

const THX = window.THX;

export default {
    name: 'reward',
    data: function() {
        return {
            network: null,
            assets: {
                stars: StarsSrc
            },
            pool: {
                name: "",
            },
            reward: {},
            rewards: [],
            currentReward: this.$route.params.id,
            lastRewardId: '',
            lastId: -1
        }
    },
    mounted() {
        if (localStorage.lastId) {
            this.lastId = localStorage.lastId;
        }
    },
    methods: {
        async init(firstTime) {
            const pool = THX.ns.instances.pool;
            this.pool.name = await pool.methods.name().call()
            this.reward = await this.getReward(this.$route.params.id)
            if (firstTime) {
                this.rewards = await this.getRewardList(this.lastId)
            }
            this.currentReward = this.$route.params.id
            localStorage.setItem('lastId', this.$route.params.id);
        },
        async getReward(rewardId) {
            const pool = this.network.instances.pool
            let loadedReward = await pool.methods.rewards(rewardId).call()

            let reward = [];
            // Get current reward data from URL.
            if (typeof loadedReward !== 'undefined') {
                reward.amount = loadedReward.amount;
                reward.slug = loadedReward.slug;
                return reward;
            }

            return []
        },
        close() {
            this.$router.push('/');
        },
        navigateToReward(rewardId) {
            this.$router.push({
                name: 'reward',
                params: {
                    id: rewardId
                }
            });
            this.init(false)
        },
        async getRewardList(lastId) {
            const pool = THX.ns.instances.pool
            let amountOfRewards = parseInt(await pool.methods.countRewardsOf(THX.ns.accounts[0]).call())
            let rewardIds = []

            // Grab all the ID's of rewards for this beneficiaries.
            for (var i = 0; i < amountOfRewards; i++) {
                let rewardId = await pool.methods.beneficiaries(THX.ns.accounts[0], i).call()
                // If the reward ID of this address is new (aka the ID is higher than the last one generated) we
                // add it to the array of items the user should see.
                if (parseInt(rewardId) > parseInt(lastId)) {
                    rewardIds.push({
                        'id': rewardId
                    })
                }
            }

            if (typeof rewardIds[rewardIds.length - 1] !== "undefined") {
                this.lastRewardId = rewardIds[rewardIds.length - 1].id;
            } else {
                this.lastRewardId = lastId;
            }

            return rewardIds;
        }
    }
}
</script>
