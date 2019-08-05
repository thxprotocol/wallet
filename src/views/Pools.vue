<template>
    <article class="region region--container">
        <main class="region region--content">
            <ul class="list list--dotted">
                <li v-bind:key="p.address" v-for="p in pools">
                    <div class="description">
                        {{ p.address }}
                    </div>
                    <div class="action">
                        <button class="btn btn-primary" @click="openPool(p.address)">Open pool</button>
                    </div>
                </li>
            </ul>
            <button class="btn btn-success btn-block">
                Add Reward Pool
            </button>
        </main>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';

export default {
    name: 'pools',
    data: function() {
        return {
            pools: {},
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            const uid = firebase.auth().currentUser.uid;

            firebase.database().ref('pools').child(uid).once('value').then((s) => {
                this.pools = s.val();
            });

            this.$parent.$refs.header.updateBalance();
        },
        openPool(poolAddress) {
            return this.$router.replace(`/pools/${poolAddress}`);
        }
    }
}
</script>
