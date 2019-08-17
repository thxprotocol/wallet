<template>
    <article class="region region--container">
        <main class="region region--content">
            <ul class="list list--dotted">
                <li v-bind:key="p.address" v-for="p in pools">
                    <div class="description">
                        {{ p.address }}
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
                    <input v-model="poolName" type="text" placeholder="Volunteers United" />
                    <input v-model="poolAddress" type="text" placeholder="0x0000000000000000000000000000" />
                </div>
                <template slot="footer">
                    <button @click="onJoinPool()" class="btn btn--success">Join Reward Pool</button>
                </template>
            </modal>
        </main>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import modal from '../components/Modal';

export default {
    name: 'pools',
    components: {
        modal
    },
    data: function() {
        return {
            pools: {},
            poolName: '',
            poolAddress: '',
            showJoinPoolModal: false,
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            firebase.database().ref('pools').once('value').then((s) => {
                this.pools = s.val();

                this.$parent.$refs.header.updateBalance();
            });
        },
        onJoinPool() {
            firebase.database().ref('pools').child(this.poolAddress).set({
                address: this.poolAddress
            });

            return this.showJoinPoolModal = false;
        },
        onLeavePool(poolAddress) {
            return firebase.database().ref('pools').child(poolAddress).remove();
        },
        openPool(poolAddress) {
            return this.$router.replace(`/pools/${poolAddress}`);
        }
    }
}
</script>
