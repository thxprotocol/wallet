<template>
    <div class="mb-2 w-100">
        <b-card
            tag="article"
            footer-tag="footer"
            header-tag="header">

            <template slot="header" v-if="!reward.loading">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center justify-content-between">
                        <profile-picture :uid="reward.beneficiary.uid" size="xs" class="mr-2" />
                        <span>
                            <strong> {{ reward.beneficiary.firstName }} {{ reward.beneficiary.lastName }}</strong>
                            claims
                            <strong>{{ reward.amount}} THX</strong>
                            for rule
                            <span class="badge badge-primary ml-1 mr-1">
                                #{{ reward.rule }}
                            </span>
                            <span v-if="reward.state === 'Approved'" class="badge badge-success">
                                {{ reward.state }}
                            </span>
                            <span v-if="reward.state === 'Rejected' " class="badge badge-danger">
                                {{ reward.state }}
                            </span>
                            <span v-if="reward.state === 'Withdrawn' " class="badge badge-warning">
                                {{ reward.state }}
                            </span>
                            <span v-if="reward.state === 'Pending' " class="badge badge-info">
                                {{ reward.state }}
                            </span>

                        </span>
                    </div>
                    <small>{{reward.startTime | moment("MMMM Do YYYY HH:mm") }}</small>
                </div>

            </template>

            <template v-if="!reward.loading">
                <h3>Votes ({{reward.totalVoted}}):</h3>
                <div class="row">
                    <div class="col-12">
                        <b-progress
                            variant="info"
                            :value="((now - reward.startTime) / (reward.endTime - reward.startTime)) * 100"
                            :max="100"
                        ></b-progress>
                    </div>
                    <div class="col-6">
                        <small>{{reward.startTime | moment("MMMM Do YYYY HH:mm") }}</small>
                    </div>
                    <div class="col-6 text-right">
                        <small>{{reward.endTime | moment("MMMM Do YYYY HH:mm") }}</small>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12">
                        <b-progress show-progress :max="(reward.yesCounter + reward.noCounter)">
                            <b-progress-bar variant="success" :value="reward.yesCounter"></b-progress-bar>
                            <b-progress-bar variant="danger" :value="reward.noCounter"></b-progress-bar>
                        </b-progress>
                    </div>
                    <div class="col-6">
                        <small>{{reward.yesCounter}}</small>
                    </div>
                    <div class="col-6 text-right">
                        <small>{{reward.noCounter}}</small>
                    </div>
                </div>
            </template>

            <button class="btn btn-link btn-block" @click="update()">
                <span v-if="!reward.loading">Update poll results</span>
                <div v-else class="d-flex w-100 justify-content-center">
                    <b-spinner variant="dark" ></b-spinner>
                </div>
            </button>

            <template slot="footer">
                <template v-if="isManager">
                    <div class="row" v-if="now < reward.endTime">
                        <div class="col-md-6" v-if="!reward.hasVoted">
                            <button @click="vote(true)" :class="{ disabled: reward.loading }" class="btn btn-success btn-block mb-2">
                                Approve
                            </button>
                        </div>
                        <div class="col-md-6" v-if="!reward.hasVoted">
                            <button @click="vote(false)" :class="{ disabled: reward.loading }" class="btn btn-danger btn-block">
                                Reject
                            </button>
                        </div>
                        <div class="col-md-12" v-if="reward.hasVoted">
                            <button @click="revokeVote()" :class="{ disabled: reward.loading }" class="btn btn-link btn-block">
                                Revoke your vote
                            </button>
                        </div>
                    </div>
                    <template v-if="!reward.finalized && now > reward.endTime">
                        <button @click="tryToFinalize()" :class="{ disabled: loading }" class="btn btn-link btn-block">
                            Finalize Poll
                        </button>
                    </template>
                </template>
                <template v-if="reward.finalized && canWithdraw && reward.state === 'Approved'">
                    <button @click="withdraw()" :class="{ disabled: reward.loading }" class="btn btn-success btn-block">
                        Withdraw
                    </button>
                </template>
            </template>

        </b-card>
    </div>
</template>

<script src="./Reward.ts" lang="ts"></script>
