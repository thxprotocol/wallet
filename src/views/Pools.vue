<template>
    <article class="region region--container">
        <main class="region region--content">
            <b-card
                v-bind:key="p.address"
                v-for="p in pools"
                v-if="p.name"
                v-bind:title="p.name"
                v-bind:sub-title="p.address"
                footer-tag="footer"
                tag="article"
                class="mb-2">

                <b-card-text>
                </b-card-text>

                <template slot="footer" class="text-right">
                    <b-link href="#" class="card-link" @click="onLeavePool(p.address)">Leave pool</b-link>
                    <b-link href="#" class="card-link" @click="openPool(p.address)">Open pool</b-link>
                </template>

            </b-card>

            <button class="btn btn-primary btn-block" @click="showJoinPoolModal = true">
                Add Reward Pool
            </button>

            <modal v-if="showJoinPoolModal" @close="showJoinPoolModal = false">
                <h3 slot="header">Join Reward Pool:</h3>
                <div slot="body">
                    <input v-model="poolAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000" />
                    <label for="poolImage">Upload Pool image:</label>
                    <input id="poolImage" type="file">
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
import { BCard, BCardText, BLink } from 'bootstrap-vue';

export default {
    name: 'pools',
    components: {
        modal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-link': BLink,
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
