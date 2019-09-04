<template>
    <article class="region region--container">
        <main class="region region--content">
            <h2>Pools</h2>
            <BCard
                v-bind:key="p.address"
                v-for="p in pools"
                footer-tag="footer"
                header-tag="header"
                tag="article"
                class="mb-2">

                <template slot="header" class="">
                    <span v-if="p.outOfSync" class="badge badge-danger float-right">Out of sync</span>
                    <span v-if="!p.outOfSync" class="badge badge-success float-right">Up to date</span>
                    <strong>{{p.name}}</strong><br>
                    <small>{{p.address}}</small>
                </template>

                <BCardText>
                    <p><strong>Pool size: {{p.balance}} THX</strong></p>
                    <div class="text-right">
                        <button class="btn btn-link card-link" @click="onLeavePool(p.address)">Leave pool</button>
                        <button class="btn btn-link card-link" @click="openPool(p.address)">Open pool</button>
                    </div>
                </BCardText>

            </BCard>

            <p v-if="loading" class="d-flex w-100 justify-content-center">
                <BSpinner></BSpinner>
            </p>

            <button class="btn btn-primary btn-block" @click="showJoinPoolModal = true">
                Add Reward Pool
            </button>

            <modal v-if="showJoinPoolModal" @close="showJoinPoolModal = false">
                <h3 slot="header">Join Reward Pool:</h3>
                <div slot="body">
                    <input v-model="poolAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000" />
                </div>
                <template slot="footer">
                    <button @click="onJoinPool()" class="btn btn-primary">Join Pool</button>
                </template>
            </modal>
        </main>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import modal from '../components/Modal';
import Vue from 'vue';
import RewardPool from '../contracts/RewardPool.json';
import { BCard, BCardText, BSpinner } from 'bootstrap-vue';

export default {
    name: 'pools',
    components: {
        modal,
        BCard,
        BCardText,
        BSpinner,
    },
    data: function() {
        return {
            loading: false,
            pools: {},
            contracts: {},
            poolAddress: '',
            showJoinPoolModal: false,
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            const uid = firebase.auth().currentUser.uid;

            this.loading = true;

            firebase.database().ref(`users/${uid}/pools`).on('child_added', async (s) => {
                const THX = window.THX;
                const token = THX.network.instances.token;
                const utils = THX.network.loom.utils;
                const hash = RewardPool.networks[9545242630824].transactionHash;
                const receipt = await THX.network.loom.eth.getTransactionReceipt(hash);

                let data = s.val();

                this.contracts[data.address] = await THX.network.contract(RewardPool, data.address);

                data.name = await this.contracts[data.address].methods.name().call();

                if (data.name && receipt) {
                    data.outOfSync = (data.address !== receipt.contractAddress);
                    data.balance = utils.fromWei(await token.methods.balanceOf(data.address).call(), 'ether');
                }

                this.loading = false;

                Vue.set(this.pools, data.address, data);
            });

            firebase.database().ref(`users/${uid}/pools`).on('child_removed', (s) => {
                Vue.delete(this.pools, s.key);
            })
        },
        onJoinPool() {
            const uid = firebase.auth().currentUser.uid;

            firebase.database().ref(`users/${uid}/pools`).child(this.poolAddress).set({
                address: this.poolAddress
            });

            return this.showJoinPoolModal = false;
        },
        onLeavePool(poolAddress) {
            const uid = firebase.auth().currentUser.uid;

            return firebase.database().ref(`users/${uid}/pools`).child(poolAddress).remove();
        },
        openPool(poolAddress) {
            return this.$router.replace(`/pools/${poolAddress}`);
        }
    }
}
</script>
