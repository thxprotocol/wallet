<template>
    <div class="mb-2 w-100">
        <b-card v-if="!loading" :no-body="!showDetails" tag="article" footer-tag="footer" header-tag="header">
            <template slot="header">
                <button
                    class="btn text-left flex-grow-1 d-flex align-items-center p-2"
                    @click="showDetails = !showDetails"
                >
                    <profile-picture :uid="reward.beneficiary.uid" size="xs" class="mr-3" v-if="reward.beneficiary" />
                    <div v-if="reward.beneficiary">
                        <div>
                            <strong> {{ reward.beneficiary.firstName }}</strong>
                            claims
                            <strong class="mr-1">{{ reward.amount }} THX</strong>
                            <span v-if="reward.state === 'Approved'" class="badge badge-success">
                                {{ reward.state }}
                            </span>
                            <span v-if="reward.state === 'Rejected'" class="badge badge-danger">
                                {{ reward.state }}
                            </span>
                            <span v-if="reward.state === 'Withdrawn'" class="badge badge-warning">
                                {{ reward.state }}
                            </span>
                            <span v-if="reward.state === 'Pending'" class="badge badge-info">
                                {{ reward.state }}
                            </span>
                        </div>
                        <small v-if="reward.startTime">{{ reward.startTime | moment("DD/MM/'YY HH:mm") }}</small>
                    </div>
                </button>
                <div v-if="reward.endTime && now < reward.endTime" class="p-2">
                    <button class="btn btn-link btn-sm" @click="update()">
                        Update
                    </button>
                </div>
            </template>

            <div :class="{ disabled: now > reward.endTime || disabled }" v-if="showDetails">
                <h3>Votes ({{ reward.totalVoted }}):</h3>
                <div class="row">
                    <div class="col-12">
                        <b-progress
                            variant="info"
                            :value="((now - reward.startTime) / (reward.endTime - reward.startTime)) * 100"
                            :max="100"
                        ></b-progress>
                    </div>
                    <div class="col-6" v-if="reward.startTime">
                        <small>{{ reward.startTime | moment("DD/MM/'YY HH:mm") }}</small>
                    </div>
                    <div class="col-6 text-right" v-if="reward.endTime">
                        <small>{{ reward.endTime | moment("DD/MM/'YY HH:mm") }}</small>
                    </div>
                </div>
                <div class="row mt-2 mb-2">
                    <div class="col-12">
                        <b-progress show-value :max="reward.yesCounter + reward.noCounter">
                            <b-progress-bar variant="success" :value="reward.yesCounter"></b-progress-bar>
                            <b-progress-bar variant="danger" :value="reward.noCounter"></b-progress-bar>
                        </b-progress>
                    </div>
                </div>
            </div>

            <template slot="footer">
                <button
                    v-if="now > reward.endTime && canWithdraw"
                    @click="withdraw()"
                    :class="{ disabled: disabled }"
                    class="btn btn-success btn-block"
                >
                    Withdraw
                </button>
                <template v-if="now > reward.endTime && !canWithdraw && !reward.finalized">
                    <button @click="tryToFinalize()" :class="{ disabled: disabled }" class="btn btn-link btn-block">
                        Finalize Poll
                    </button>
                </template>
                <template v-if="pool.isManager">
                    <div class="row" v-if="now < reward.endTime">
                        <div class="col-md-6" v-if="!reward.hasVoted">
                            <button
                                @click="vote(true)"
                                :class="{ disabled: disabled }"
                                class="btn btn-success btn-block mb-2"
                            >
                                Approve
                            </button>
                        </div>
                        <div class="col-md-6" v-if="!reward.hasVoted">
                            <button
                                @click="vote(false)"
                                :class="{ disabled: disabled }"
                                class="btn btn-danger btn-block"
                            >
                                Reject
                            </button>
                        </div>
                        <div class="col-md-12" v-if="reward.hasVoted">
                            <button
                                @click="revokeVote()"
                                :class="{ disabled: disabled }"
                                class="btn btn-link btn-block"
                            >
                                Revoke your vote
                            </button>
                        </div>
                    </div>
                </template>
            </template>
        </b-card>
    </div>
</template>

<script src="./Reward.ts" lang="ts"></script>
