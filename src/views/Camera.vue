<template>
    <article class="region region--container">
        <div class="loader">Loading...</div>
        <qrcode-stream @decode="onDecode"></qrcode-stream>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';

const THX = window.THX;

export default {
    name: 'Camera',
    data: function() {
        return {
        }
    },
    created() {
        // eslint-disable-next-line
        THX.ns.connect().then(() => this.init()).catch(() => console.error);
    },
    methods: {
        onDecode (decodedString) {
            if (decodedString.length > 0) {
                const ref = firebase.database().ref('rewards');
                const id = ref.push().key;
                let data = JSON.parse(decodedString);

                ref.child(id).set(data);

                this.addReward(data.key, data.slug, data.amount);
            }
        },
        async addReward(key, slug, amount) {
            const pool = THX.ns.instances.pool;
            const data = pool.methods.addReward(key, slug, amount).encodeABI();
            const rawTx = await THX.ns.signContractMethod(pool.address, data);

            return await THX.ns.sendSignedTransaction(rawTx);
        },
        async addRule(key, slug, amount) {
            const pool = THX.ns.instances.pool;
            const data = pool.methods.addRule(key, slug, amount).encodeABI();
            const rawTx = await THX.ns.signContractMethod(pool.address, data);

            return await THX.ns.sendSignedTransaction(rawTx);
        },
        async getRewards() {
            const pool = THX.ns.instances.pool;
            pool.methods.getRewards();
        }
    }
}
</script>
<style>
    .wrapper,
    .inside,
    .inside video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
    }
</style>
