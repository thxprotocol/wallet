<template>
    <article class="region region-container">
        <div v-if="loading" class="d-flex w-100 h-100 align-items-center justify-content-center">
            <BSpinner></BSpinner>
        </div>

        <div class="ui-file">
            <h3>Upload QR code image</h3>
            <QrcodeCapture @decode="onDecode"></QrcodeCapture>
        </div>

        <QrcodeStream @init="onInit" @decode="onDecode" :track="repaint"></QrcodeStream>

        <div v-if="!loading && hasStream" class="ui-camera">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>

    </article>
</template>
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
<script src="./Camera.ts"></script>
