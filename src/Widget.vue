<template>
    <div class="widget">
        <div class="row">
            <div class="col-7">
                <h1>Congratulations!</h1>
                <p class="lead">You have earned <strong>250 THX</strong>.</p>
                <p>Use the <a href="https://www.thxproject.com" target="_blank">THX Wallet</a> to claim your reward by scanning this QR code.</p>
            </div>
            <div class="col-5 d-flex align-items-center">
                <canvas id="canvas"></canvas>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

export default {
    name: 'Widget',
    components: {},
    data: function() {
        return {

        }
    },
    mounted() {
        const rule = this.$route.params.rule;
        const pool = this.$route.params.pool;

        if (rule && pool) {
            const canvas = document.getElementById('canvas');
            const json = JSON.stringify({
                rule: rule,
                pool: pool,
            });

            QRCode.toCanvas(canvas, json, (error) => {
                if (error) console.error(error)
            });
        }
    },
    methods: {

    }
}
</script>

<style lang="scss" scoped>
    h1 {
        font-weight: bold;
        font-size: 1.5rem;
        display: block;
        margin: 0px;
    }

    .lead {
        font-size: 1rem;
        margin-bottom: 2rem;
    }

    .widget {
        padding: 2em;
        background-color: #FDE542;
    }

    #canvas {
        width: 135px !important;
        height: 135px !important;
        
        @media (max-width: 430px) {
            width: 120px !important;
            height: 120px !important;
        }
    }

</style>
