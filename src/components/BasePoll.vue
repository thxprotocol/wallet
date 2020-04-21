<template>
    <div>
        <h3>Votes ({{ poll.totalVoted }}):</h3>
        <div class="row">
            <div class="col-12">
                <b-progress
                    variant="info"
                    :value="((now - poll.startTime) / (poll.endTime - poll.startTime)) * 100"
                    :max="100"
                ></b-progress>
            </div>
            <div class="col-6" v-if="poll.startTime">
                <small>{{ poll.startTime | moment("DD/MM/'YY HH:mm") }}</small>
            </div>
            <div class="col-6 text-right" v-if="poll.endTime">
                <small>{{ poll.endTime | moment("DD/MM/'YY HH:mm") }}</small>
            </div>
        </div>
        <div class="row mt-2 mb-2">
            <div class="col-12">
                <b-progress show-value :max="poll.yesCounter + poll.noCounter">
                    <b-progress-bar variant="success" :value="poll.yesCounter"></b-progress-bar>
                    <b-progress-bar variant="danger" :value="poll.noCounter"></b-progress-bar>
                </b-progress>
            </div>
        </div>
    </div>
</template>

<script src="./BasePoll.ts" lang="ts"></script>
