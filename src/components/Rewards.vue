<template>
    <article>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <th>#</th>
                    <th>slug</th>
                    <th>amount</th>
                    <th>actions</th>
                    <th>state</th>
                </thead>

                <Reward
                    v-bind:key="reward.id"
                    v-for="reward in rewards"
                    v-bind:reward="reward"
                    v-bind:account="account"
                    v-bind:contract="contract"></Reward>

            </table>
        </div>

        <button class="btn btn-link" @click="getRewards()">Refresh</button>

    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService';
import Vue from 'vue';
import Reward from './Reward';
import modal from './Modal';

export default {
    name: 'Rewards',
    components: {
        Reward,
    },
    data: function() {
        return {
            loading: false,
            events: new EventService(),
            rewards: []
        }
    },
    props: {
        contract: null,
        account: {
            loom: {
                address: ''
            },
            isManager: false,
            isMember: false,
        }
    },
    mounted() {
        this.getRewards();
    },
    methods: {
        async subscribeRewardEvents() {
            const THX = window.THX;
            const amount = await this.contract.methods.countRewards().call();

            for (let i = 0; i < parseInt(amount); i++) {
                const rewardAddress = await this.contract.methods.rewards(i).call();
                const reward = await THX.network.contract(Reward, rewardAddress);
                const state = await reward.methods.state().call();

                if (state !== 2) {
                    this.events.subscribeRewardEvents(reward.events);
                }
            }
        },
        async getRewards() {
            const amountOfRewards = parseInt( await this.contract.methods.countRewards().call() );

            for (let i = 0; i < amountOfRewards; i++) {
                const reward = await this.contract.methods.rewards(i).call();

                Vue.set(this.rewards, reward.id, {
                    id: reward.id,
                    slug: reward.slug,
                    beneficiary: reward.beneficiary,
                    amount: reward.amount,
                    state: reward.state,
                    created: reward.created,
                });
            }
        },
    }
}
</script>
