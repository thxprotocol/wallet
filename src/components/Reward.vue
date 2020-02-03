<template>
    <b-card tag="article"
        footer-tag="footer"
        header-tag="header"
        class="mb-2" v-if="!reward.loading">

        <template slot="header">
            <div class="d-flex align-items-center justify-content-between">

                <div class="d-flex align-items-center justify-content-between">

                    <profile-picture :uid="reward.beneficiary.uid" size="xs" class="mr-2" />

                    <span>
                        <strong> {{ reward.beneficiary.firstName }} {{ reward.beneficiary.lastName }}</strong>
                        claims
                        <strong>{{ reward.amount}} THX</strong>
                        for rule
                        <span class="badge badge-primary ml-1">
                            #{{ reward.id }}
                        </span>
                    </span>
                </div>
                <span v-if="reward.state === 'Approved'" class="badge badge-success">
                    {{ reward.state }}
                </span>
                <span v-if="reward.state === 'Rejected' " class="badge badge-danger">
                    {{ reward.state }}
                </span>
            </div>

        </template>
        <hr class="dotted">
        <h3>Poll period:</h3>
        <div class="row">
            <div class="col-12">
                <b-progress
                    variant="info"
                    :value="((now - reward.startTime) / (reward.endTime - reward.startTime)) * 100"
                    :max="100"
                ></b-progress>
            </div>
            <div class="col-6">
                {{reward.startTime | moment("MMMM Do YYYY HH:mm") }}
            </div>
            <div class="col-6 text-right">
                {{reward.endTime | moment("MMMM Do YYYY HH:mm") }}
            </div>
        </div>

        <template slot="footer" v-if="isManager">
            <template v-if="!reward.hasVoted && now < reward.endTime">
                <button @click="vote(true)" :class="{ disabled: reward.loading }" class="btn btn-primary">
                    Approve
                </button>
                <button @click="vote(false)" :class="{ disabled: reward.loading }" class="btn btn-primary">
                    Reject
                </button>
            </template>
            <template v-if="reward.hasVoted && now < reward.endTime">
                <button @click="revokeVote()" :class="{ disabled: reward.loading }" class="btn btn-primary">
                    Revoke
                </button>
            </template>
            <template v-if="now > reward.endTime">
                <button @click="tryToFinalize()" :class="{ disabled: loading }" class="btn btn-primary btn-block">
                    Finalize Poll
                </button>
            </template>
        </template>

    </b-card>
</template>

<script src="./Reward.ts" lang="ts"></script>
