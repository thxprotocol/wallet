<template>
    <article class="region region-container">
        <div v-if="loading" class="d-flex w-100 h-100 align-items-center justify-content-center">
            <BSpinner></BSpinner>
        </div>

        <div class="ui-file">
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
import RewardPool from '../contracts/RewardPool.json';
import { BSpinner } from 'bootstrap-vue';

export default {
    name: 'Camera',
    components: {
        BSpinner
    },
    data: function() {
        return {
            loading: true,
            hasStream: false,
        }
    },
    methods: {
        repaint () {
            return
        },
        toast(title, body, variant = 'info') {
            this.$bvToast.toast(body, {
                title: title,
                toaster: 'b-toaster-bottom-full',
                autoHideDelay: 3000,
                appendToast: true,
                variant: variant,
            })
        },
        async onInit (promise) {
            try {
                await promise
                this.hasStream = true;
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    this.toast('Camera error:', "user denied camera access permisson");
                } else if (error.name === 'NotFoundError') {
                    this.toast('Camera error:', "no suitable camera device installed");
                } else if (error.name === 'NotSupportedError') {
                    this.toast('Camera error:', "page is not served over HTTPS (or localhost)");
                } else if (error.name === 'NotReadableError') {
                    this.toast('Camera error:', "maybe camera is already in use");
                } else if (error.name === 'OverconstrainedError') {
                    this.toast('Camera error:', "did you requested the front camera although there is none?");
                } else if (error.name === 'StreamApiNotSupportedError') {
                    this.toast('Camera error:', "browser seems to be lacking features");
                }
                this.hasStream = false;
            } finally {
                this.loading = false;
            }
        },
        async onDecode (decodedString) {
            const THX = window.THX;

            if (decodedString.length > 0) {
                const poolsRef = firebase.database().ref(`pools`);
                const data = JSON.parse(decodedString);
                const pool = await THX.network.contract(RewardPool, data.pool);

                poolsRef.child(data.pool).child(`rewards`).push().set(data);

                this.toast(
                    'Reward status update',
                    `Claiming your reward for rule #${data.rule} in pool ${data.pool}...`,
                );

                pool.methods.createReward(data.rule).send({ from: THX.network.account.address }).then((tx) => {
                    this.toast(
                        'Reward status update',
                        'Your claim is up for review!',
                        'success'
                    );
                    //eslint-disable-next-line
                    console.log(tx);
                });
            }
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
        background: rgba(255,255,255,.75);
        border-radius: 35px;
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
