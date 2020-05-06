<template>
    <article class="region region-container">
        <div class="alert alert-danger alert-fixed" v-if="error">
            <button type="button" aria-label="Close" class="close" @click="error = ''">×</button>
            <span v-html="error"></span>
        </div>

        <div class="d-flex w-100 h-100 align-items-center justify-content-center bg-yellow" v-if="rule && pool">
            <div v-if="loading">
                <b-spinner></b-spinner>
            </div>
            <div v-else class="text-center">
                <h1>
                    You are rewarded
                    <span>{{ rule.amount }} THX!</span>
                </h1>
                <p class="lead">
                    for applying to rule <strong>{{ rule.title }}</strong>
                </p>
                <button class="btn btn-primary btn-lg mt-4" @click="claim()">Claim {{ rule.amount }} THX</button>
            </div>
        </div>

        <div class="d-flex w-100 h-100 align-items-center justify-content-center bg-yellow" v-if="slack && pool">
            <div v-if="loading">
                <b-spinner></b-spinner>
            </div>
            <div v-else class="text-center">
                <h1>
                    Connect your account!
                </h1>
                <p class="lead">
                    with Slack ID <strong>{{ slack }}</strong>
                </p>
                <button class="btn btn-primary btn-lg mt-4" @click="connect()">
                    Connect Account
                </button>
            </div>
        </div>

        <qrcode-stream
            :class="hasStream ? 'ui-video' : 'd-none'"
            @init="init"
            @decode="onDecode"
            :track="repaint"
        ></qrcode-stream>
        <qrcode-capture
            id="uploadBtn"
            class="d-none"
            :capture="false"
            :multiple="false"
            @decode="onDecode"
        ></qrcode-capture>

        <template v-if="hasStream && !loading && !rule && !slack">
            <div class="ui-camera">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="ui-file">
                <label for="uploadBtn">
                    <span class="btn btn-primary btn-lg mt-4">
                        Upload Picture
                    </span>
                </label>
            </div>
        </template>

        <div
            class="d-flex w-100 h-100 align-items-center justify-content-center bg-yellow"
            v-if="!hasStream && !loading && !rule && !slack"
        >
            <div v-if="loading">
                <b-spinner></b-spinner>
            </div>
            <div v-else class="text-center">
                <h1>
                    Submit a QR code
                </h1>
                <p class="lead">
                    Make sure that you are connected to the network.
                </p>

                <label for="uploadBtn">
                    <span class="btn btn-primary btn-lg mt-4">
                        Upload Picture
                    </span>
                </label>
            </div>
        </div>
    </article>
</template>
<style lang="scss">
.bg-yellow {
    background-color: #fde542;

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
        border-top: 5px solid rgba(0, 0, 0, 0.5);
        border-left: 5px solid rgba(0, 0, 0, 0.5);
    }

    &:nth-child(2) {
        top: 0;
        right: 0;
        border-top: 5px solid rgba(0, 0, 0, 0.5);
        border-right: 5px solid rgba(0, 0, 0, 0.5);
    }

    &:nth-child(3) {
        bottom: 0;
        right: 0;
        border-bottom: 5px solid rgba(0, 0, 0, 0.5);
        border-right: 5px solid rgba(0, 0, 0, 0.5);
    }

    &:nth-child(4) {
        bottom: 0;
        left: 0;
        border-bottom: 5px solid rgba(0, 0, 0, 0.5);
        border-left: 5px solid rgba(0, 0, 0, 0.5);
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
        color: black;
    }

    input[type='file'] {
        background: rgba(255, 255, 255, 0.75);
        border-radius: 35px;
        padding: 1rem;
        font-size: 1rem;
        font-family: Arial;
        margin: auto;
        display: block;

        &:focus {
            background: #efefef;
        }
    }
}
</style>
<script src="./Camera.ts" lang="ts"></script>
