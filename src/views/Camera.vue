<template>
    <article class="region region--container">
        <div v-if="loading && !hasStream" class="loader">Loading...</div>
        <div v-if="!hasStream" class="ui-file">
            <h3>Upload QR code image</h3>
            <qrcode-capture @decode="onDecode" />
        </div>
        <qrcode-stream @init="onInit" @decode="onDecode" :track="repaint"></qrcode-stream>
        <div v-if="!loading && hasStream" class="ui-camera">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';

import StateService from '../services/StateService.js';

const THX = window.THX;

export default {
    name: 'Camera',
    data: function() {
        return {
            loading: true,
            hasStream: false,
            state: new StateService(),
        }
    },
    mounted() {
        const uid = firebase.auth().currentUser.uid;
        const key = (typeof this.state.getItem('privateKey') !== "undefined") ? this.state.getItem('privateKey') : null;

        this.init(uid, key);
    },
    methods: {
        repaint () {
            return
        },
        async init(uid, key) {
            await THX.contracts.load(key);
        },
        async onInit (promise) {
            try {
                await promise
                this.hasStream = true;
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    alert("user denied camera access permisson");
                } else if (error.name === 'NotFoundError') {
                    alert("no suitable camera device installed");
                } else if (error.name === 'NotSupportedError') {
                    alert("page is not served over HTTPS (or localhost)");
                } else if (error.name === 'NotReadableError') {
                    alert("maybe camera is already in use");
                } else if (error.name === 'OverconstrainedError') {
                    alert("did you requested the front camera although there is none?");
                } else if (error.name === 'StreamApiNotSupportedError') {
                    alert("browser seems to be lacking features");
                }
                this.hasStream = false;
            } finally {
                this.loading = false;
            }
        },
        onDecode (decodedString) {
            if (decodedString.length > 0) {
                const ref = firebase.database().ref('rewards');
                const id = ref.push().key;
                let data = JSON.parse(decodedString);

                ref.child(id).set(data);

                alert(`Reward ${id} is being processed...`)

                this.addReward(data.key, data.slug, data.amount);
            }
        },
        async addReward(key, slug, amount) {
            const pool = THX.contracts.instances.pool;

            return await  pool.methods.addReward(key, slug, amount).send({ from: THX.contracts.currentUserAddress });
        },
        async addRule(key, slug, amount) {
            const pool = THX.contracts.instances.pool;

            return await pool.methods.addRule(key, slug, amount).send({ from: THX.contracts.currentUserAddress });
        },
        async getRewards() {
            const pool = THX.contracts.instances.pool;
            return await pool.methods.getRewards();
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

    .wrapper + .ui-camera {
        display: block;
    }

    .ui-camera {
        display: none;
        width: 200px;
        height: 200px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -100px;
        margin-top: -100px;
    }

    .ui-camera span {
        display: block;
        width: 20px;
        height: 20px;
        position: absolute;
    }

    .ui-camera span:nth-child(1) {
        top: 0;
        left: 0;
        border-top: 5px solid rgba(0,0,0,.5);
        border-left: 5px solid rgba(0,0,0,.5);
    }

    .ui-camera span:nth-child(2) {
        top: 0;
        right: 0;
        border-top: 5px solid rgba(0,0,0,.5);
        border-right: 5px solid rgba(0,0,0,.5);
    }

    .ui-camera span:nth-child(3) {
        bottom: 0;
        right: 0;
        border-bottom: 5px solid rgba(0,0,0,.5);
        border-right: 5px solid rgba(0,0,0,.5);
    }

    .ui-camera span:nth-child(4) {
        bottom: 0;
        left: 0;
        border-bottom: 5px solid rgba(0,0,0,.5);
        border-left: 5px solid rgba(0,0,0,.5);
    }

    .ui-file {
        position: absolute;
        bottom: calc(60px + 1rem);
        left: 0;
        text-align: center;
        width: 100%;
        z-index: 1;
    }

    .ui-file input[type="file"] {
        background: white;
        border: 2px dashed #EFEFEF;
        padding: 1rem;
        font-size: 1rem;
        font-family: "Ubuntu";
        margin: auto;
        display: block;
    }

    .ui-file input[type="file"]:focus {
        background: #EFEFEF;
    }
</style>
