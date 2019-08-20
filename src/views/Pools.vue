<template>
    <article class="region region--container">
        <main class="region region--content">
            <ul class="list list--dotted">
                <li v-bind:key="p.address" v-for="p in pools">
                    <div class="description">
                        <strong>{{ p.name }}</strong>
                        <span>{{ p.address }}</span>
                    </div>
                    <div class="action">
                        <button class="btn btn-link" @click="onLeavePool(p.address)">Leave pool</button>
                        <button class="btn btn-primary" @click="openPool(p.address)">Open pool</button>
                    </div>
                </li>
            </ul>
            <button class="btn btn-success btn-block" @click="showJoinPoolModal = true">
                Add Reward Pool
            </button>

            <modal v-if="showJoinPoolModal" @close="showJoinPoolModal = false">
                <h3 slot="header">Join Reward Pool:</h3>
                <div slot="body">
                    <input v-model="poolAddress" type="text" placeholder="0x0000000000000000000000000000" />
                </div>
                <template slot="footer">
                    <button @click="onJoinPool()" class="btn btn--success">Join Pool</button>
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

export default {
    name: 'pools',
    components: {
        modal
    },
    data: function() {
        return {
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

            firebase.database().ref(`users/${uid}/pools`).on('child_added', async (s) => {
                const THX = window.THX;
                let data = s.val();

                this.contracts[data.address] = await THX.network.contract(RewardPool, data.address);
                data.name = await this.contracts[data.address].methods.name().call();

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
