<template>
    <div class="mb-2 w-100">
        <b-card tag="article" :no-body="!showDetails" footer-tag="footer" header-tag="header" class="mb-2 w-100">
            <div class="alert alert-danger" v-if="error">
                {{ error }}
            </div>

            <template v-if="!rule.loading">
                <button slot="header" class="btn p-0 w-100 border-0" @click="showDetails = !showDetails">
                    <div class="text-light bg-blue text-center pt-3 pb-3">
                        <span class="font-size-l">{{ rule.amount }} THX</span>
                        <sup v-if="rule.state === 'Active'" class="badge badge-success badge-xs">
                            {{ rule.state }}
                        </sup>
                        <sup v-if="rule.state === 'Disabled'" class="badge badge-danger badge-xs">
                            {{ rule.state }}
                        </sup>
                    </div>
                </button>

                <template v-if="showDetails">
                    <div class="mb-0">
                        <strong> #{{ rule.id }} | {{ rule.title }} </strong>
                    </div>
                    <small class="text-muted m-0">Created: {{ rule.created | moment("DD/MM/'YY HH:mm") }}</small>
                    <p v-if="rule.description">
                        <i>{{ rule.description }}</i>
                    </p>

                    <button class="btn btn-success btn-block" @click="$refs.modalCreateReward.show()" target="_blank">
                        Claim reward
                    </button>

                    <div v-if="!pool.isMember" class="alert alert-warning mb-0 mt-3">
                        <strong>You are not a member of this pool and can not join the poll.</strong>
                    </div>

                    <template v-if="rule.hasPollAddress && poll">
                        <hr class="dotted" />
                        <div :class="{ disabled: poll.loading }">
                            <div class="alert alert-warning">
                                <small>Rule Change Proposal:</small><br />
                                <del>{{ rule.amount }} THX</del> &#x2192; <strong>{{ poll.proposedAmount }} THX</strong>
                            </div>

                            <h3>Total Votes: {{ poll.totalVoted }}</h3>
                            <div class="row">
                                <div class="col-12">
                                    <b-progress
                                        variant="info"
                                        :value="((now - poll.startTime) / (poll.endTime - poll.startTime)) * 100"
                                        :max="100"
                                    ></b-progress>
                                </div>
                                <div class="col-6">
                                    <small>{{ poll.startTime | moment("DD/MM/'YY HH:mm") }}</small>
                                </div>
                                <div class="col-6 text-right">
                                    <small>{{ poll.endTime | moment("DD/MM/'YY HH:mm") }}</small>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-12">
                                    <b-progress show-progress :max="poll.yesCounter + poll.noCounter">
                                        <b-progress-bar variant="success" :value="poll.yesCounter"></b-progress-bar>
                                        <b-progress-bar variant="danger" :value="poll.noCounter"></b-progress-bar>
                                    </b-progress>
                                </div>
                                <div class="col-6">
                                    <small>{{ poll.yesCounter }} THX</small>
                                </div>
                                <div class="col-6 text-right">
                                    <small>{{ poll.noCounter }} THX</small>
                                </div>
                            </div>
                        </div>

                        <button
                            v-if="poll"
                            :class="{ disabled: poll.loading }"
                            class="btn btn-link btn-block"
                            @click="update()"
                        >
                            Update poll results
                        </button>
                    </template>
                </template>

                <template slot="footer">
                    <template v-if="!rule.hasPollAddress && pool.isMember">
                        <button
                            @click="$refs.modalCreateRulePoll.show()"
                            :class="{ disabled: loading }"
                            class="btn btn-link btn-block"
                        >
                            Change reward size
                        </button>
                    </template>
                    <template v-if="rule.hasPollAddress && poll && pool.isMember">
                        <div class="row" v-if="now < poll.endTime">
                            <div class="col-md-6" v-if="!poll.hasVoted">
                                <button
                                    @click="vote(true)"
                                    :class="{ disabled: poll.loading }"
                                    class="btn btn-success btn-block mb-2"
                                >
                                    Approve
                                </button>
                            </div>
                            <div class="col-md-6" v-if="!poll.hasVoted">
                                <button
                                    @click="vote(false)"
                                    :class="{ disabled: poll.loading }"
                                    class="btn btn-danger btn-block"
                                >
                                    Reject
                                </button>
                            </div>
                            <div class="col-md-12" v-if="poll.hasVoted">
                                <button
                                    @click="revokeVote()"
                                    :class="{ disabled: poll.loading }"
                                    class="btn btn-link btn-block"
                                >
                                    Revoke your vote
                                </button>
                            </div>
                        </div>
                        <template v-if="now > poll.endTime">
                            <button
                                @click="tryToFinalize()"
                                :class="{ disabled: loading }"
                                class="btn btn-link btn-block"
                            >
                                Finalize Poll
                            </button>
                        </template>
                    </template>
                </template>
            </template>
        </b-card>

        <b-modal ref="modalCreateRulePoll" centered title="Propose new reward size">
            <p>
                Propose a new reward size for this rule. A poll will be started and members of the pool can vote to
                approve or reject your proposal over a set amount of time.
            </p>
            <input v-model="input.poll.proposal" type="number" class="form-control" />
            <template v-slot:modal-footer="{ ok, cancel }">
                <button @click="startRulePoll()" :class="{ disabled: loading }" class="btn btn-primary">
                    Start proposal
                </button>
            </template>
        </b-modal>

        <b-modal ref="modalCreateReward" centered title="Create a new reward for someone">
            <b-overlay :show="loading">
                <input v-model="input.reward.beneficiary" type="text" class="form-control" />
                <small v-if="input.reward.beneficiary === $network.extdev.account" class="text-muted"
                    >Mind that this is your personal address</small
                >
            </b-overlay>
            <template v-slot:modal-footer="{ ok, cancel }">
                <button
                    :class="{ disabled: loading }"
                    @click="createReward(rule.id, input.reward.beneficiary)"
                    class="btn btn-primary"
                >
                    Give Reward
                </button>
            </template>
        </b-modal>
    </div>
</template>

<script src="./Rule.ts" lang="ts"></script>
