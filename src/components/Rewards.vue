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

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService';
import Vue from 'vue';
import Reward from './Reward';
import RewardJSON from '../contracts/Reward.json';
import { BListGroup, BSpinner } from 'bootstrap-vue';

const RewardState = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];

export default {
    name: 'Rewards',
    components: {
        Reward,
        BListGroup,
        BSpinner,
    },
    data: function() {
        return {
            loading: false,
            events: new EventService(),
            rewards: [],
            amountOfRewards: -1
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
        this.loading = true;

        this.getRewards().then(()=> {
            this.loading = false;
        });

        this.events.listen('event.RewardStateChanged', this.onRewardStateChanged);
        this.events.listen('event.RewardPollCreated', this.onRewardPollCreated);
        this.events.listen('event.RewardPollFinished', this.onRewardPollFinished);
    },
    methods: {
        onRewardStateChanged(data) {
            // eslint-disable-next-line
            console.log(data)
        },
        onRewardPollCreated(data) {
            // eslint-disable-next-line
            console.log(data)
        },
        onRewardPollFinished(data) {
            // eslint-disable-next-line
            console.log(data)
        },
        async subscribeRewardEvents() {
            const THX = window.THX;
            const amount = await this.contract.methods.countRewards().call();

            for (let i = 0; i < parseInt(amount); i++) {
                const rewardAddress = await this.contract.methods.rewards(i).call();
                const reward = await THX.network.contract(RewardJSON, rewardAddress);
                const state = await reward.methods.state().call();

                if (state !== 2) {
                    this.events.subscribeRewardEvents(reward.events);
                }
            }
        },
        async getRewards() {
            const THX = window.THX;
            const utils = THX.network.loom.utils;

            this.amountOfRewards = parseInt( await this.contract.methods.countRewards().call() );

            for (let i = 0; i < this.amountOfRewards; i++) {
                const rewardAddress = await this.contract.methods.rewards(i).call();
                const reward = await THX.network.contract(RewardJSON, rewardAddress);
                const id = await reward.methods.id().call();
                const beneficiary = (await reward.methods.beneficiary().call()).toLowerCase();
                const uid = (await firebase.database().ref(`wallets/${beneficiary}`).once('value')).val().uid;
                const user = (await firebase.database().ref(`users/${uid}`).once('value')).val();
                const now = (await THX.network.loom.eth.getBlock('latest')).timestamp;
                const amount = utils.fromWei((await reward.methods.amount().call()), 'ether');

                Vue.set(this.rewards, id, {
                    contract: reward,
                    id: id,
                    uid: uid,
                    user: user,
                    slug: await reward.methods.slug().call(),
                    now: now,
                    startTime: parseInt(await reward.methods.startTime().call()),
                    endTime: parseInt(await reward.methods.endTime().call()),
                    beneficiary: beneficiary,
                    amount: amount,
                    state: RewardState[await reward.methods.state().call()],
                    created: parseInt(await reward.methods.created().call()),
                });
            }
        },
    }
}
</script>
