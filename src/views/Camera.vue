<template>
    <article class="region region-container">

         <div class="alert alert-danger alert-fixed" v-if="error">
             <button type="button" aria-label="Close" class="close" @click="error=''">×</button>
             <span v-html="error"></span>
         </div>

         <div class="alert alert-success alert-fixed" v-if="success">
             <button type="button" aria-label="Close" class="close" @click="success=''">×</button>
             <span v-html="success"></span>
         </div>

        <div v-if="loading" class="d-flex w-100 h-100 align-items-center justify-content-center">
            <b-spinner></b-spinner>
        </div>

        <div v-if="rule" class="d-flex w-100 h-100 align-items-center justify-content-center bg-yellow">
            <div class="text-center">
                <h1>
                    You are rewarded
                    <span>{{rule.amount}} THX!</span>
                </h1>
                <p class="lead">for applying to rule <strong>{{rule.title}}</strong></p>
                <button class="btn btn-primary btn-block btn-lg mt-4" @click="claim()">
                    Claim {{rule.amount}} THX
                </button>
            </div>
        </div>

        <qrcode-stream v-if="!rule" class="ui-video" @init="init" @decode="decode" :track="repaint"></qrcode-stream>

        <template v-if="!loading && !rule">
            <div class="ui-camera">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="ui-file">
                <qrcode-capture @decode="decode"></qrcode-capture>
                <small>Upload QR code image if the camera does not work on your device.</small>
            </div>
        </template>

    </article>
</template>
<style lang="scss">

    .bg-yellow {
        background-color: #FDE542;

        h1 {
            font-weight: bold;
            font-size: 2rem;
        }
    }

    .alert-fixed {
        position: fixed !important;
        top: auto;
        margin: 1rem;
        width: calc(100% - 2rem);
        z-index: 1;
    }

    .wrapper,
    .inside,
    .inside video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        position: absolute;
        top: 0;
        left: 0;
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

    .wrapper + .ui-camera {
        display: block;
    }

    .ui-camera span {
        display: block;
        width: 20px;
        height: 20px;
        position: absolute;

        &:nth-child(1) {
            top: 0;
            left: 0;
            border-top: 5px solid rgba(0,0,0,.5);
            border-left: 5px solid rgba(0,0,0,.5);
        }

        &:nth-child(2) {
            top: 0;
            right: 0;
            border-top: 5px solid rgba(0,0,0,.5);
            border-right: 5px solid rgba(0,0,0,.5);
        }

        &:nth-child(3) {
            bottom: 0;
            right: 0;
            border-bottom: 5px solid rgba(0,0,0,.5);
            border-right: 5px solid rgba(0,0,0,.5);
        }

        &:nth-child(4) {
            bottom: 0;
            left: 0;
            border-bottom: 5px solid rgba(0,0,0,.5);
            border-left: 5px solid rgba(0,0,0,.5);
        }
    }

    .ui-file {
        position: absolute;
        bottom: calc(60px + 1rem);
        left: 0;
        text-align: center;
        width: 100%;
        z-index: 1;

        small {
            margin-top: 1rem;
            display: block;
            color: white;
        }

        input[type="file"] {
            background: rgba(255,255,255,.75);
            border-radius: 35px;
            padding: 1rem;
            font-size: 1rem;
            font-family: "Ubuntu";
            margin: auto;
            display: block;

            &:focus {
                background: #EFEFEF;
            }
        }
    }
</style>
<script src="./Camera.ts" lang="ts"></script>
