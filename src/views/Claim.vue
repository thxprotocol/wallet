<template>
    <div class="h-100 widget d-flex align-items-center">
        <div :class="`confetti-${index}`" :key="k" v-for="(index, k) of confetti"></div>
        <div class="container">
            <div class="row">
                <div class="col-md-6 offset-md-3 p-3 text-center">
                    <div class="card card-light">
                        <div class="card-body">
                            <div class="alert alert-danger" v-if="error">{{ error }}</div>

                            <template v-if="!isClaimed && !$network.extdev">
                                <canvas ref="canvas" class="qrcode"></canvas>
                                <h1>Congratulations!</h1>
                                <p class="lead">You have earned a reward.</p>
                                <p>
                                    Open your
                                    <a
                                        href="https://wallet.thxprotocol.com/"
                                        target="_blank"
                                    >THX Wallet</a> on
                                    a device with a camera and claim your reward by scanning this QR code.
                                </p>
                            </template>

                            <template v-if="!isClaimed && $network.extdev && rule">
                                <h1>
                                    You are rewarded
                                    <span>{{ rule.amount }} THX!</span>
                                </h1>
                                <p class="lead">
                                    for applying to rule
                                    <strong>{{ rule.title }}</strong>
                                </p>
                                <button
                                    class="btn btn-primary btn-block btn-lg mt-4"
                                    @click="claim()"
                                >Claim {{ rule.amount }} THX</button>
                            </template>

                            <template v-if="isClaimed">
                                <svg
                                    class="mt-3 mb-4 icon-trophy"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    focusable="false"
                                    role="img"
                                    viewBox="0 0 576 512"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7 39.3-28.3 61.9-65 61.9-100.7V88c0-13.3-10.7-24-24-24zM99.3 192.8C74.9 175.2 64 155.6 64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-15.1-5.2-29.2-12.4-41.7-21.4zM512 144c0 16.1-17.7 36.1-35.3 48.8-12.5 9-26.7 16.2-41.8 21.4 7-25 11.8-53.6 12.8-86.2H512v16z"
                                    />
                                </svg>
                                <h1>Well done!</h1>
                                <p class="lead">You have claimed your reward.</p>
                                <p>
                                    A pool manager will review your claim before
                                    <br />your reward can be withdrawn.
                                </p>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script src="./Claim.ts" lang="ts"></script>

<style lang="scss">
body {
    overflow: hidden;
}

.widget {
    background-color: #fde542;

    .icon-trophy {
        width: 150px;
        display: block;
        margin: auto;

        path {
            fill: #28a745 !important;
        }
    }

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

    .card {
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
        border-radius: 10px;
    }

    .qrcode {
        width: 220px !important;
        height: 220px !important;

        @media (max-width: 430px) {
            width: 150px !important;
            height: 150px !important;
        }
    }

    [class|='confetti'] {
        position: absolute;
    }
}

$colors: (#d13447, #ffbf00, #263672);

@for $i from 0 through 150 {
    $w: random(20);
    $l: random(100);
    .confetti-#{$i} {
        width: #{$w}px;
        height: #{$w * 0.5}px;
        background-color: nth($colors, random(3));
        top: -10%;
        left: unquote($l + '%');
        opacity: random() + 0.5;
        transform: rotate(#{random() * 360}deg);
        animation: drop-#{$i} unquote(1 + random(11) + 's') unquote(random() + 's') infinite;
        animation-delay: unquote(4 * random() + 's');
    }

    @keyframes drop-#{$i} {
        100% {
            top: 110%;
            left: unquote($l + random(15) + '%');
        }
    }
}
</style>
