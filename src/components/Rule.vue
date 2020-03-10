<template>
    <div class="mb-2 w-100">
        <b-card
            tag="article"
            footer-tag="footer"
            header-tag="header"
            class="mb-2 w-100">

            <div class="alert alert-danger" v-if="error">
                {{error}}
            </div>

            <div v-if="rule.loading" class="d-flex w-100 justify-content-center">
                <b-spinner variant="primary" ></b-spinner>
            </div>

            <template v-else>
                <template slot="header">

                    <span class="text-muted mr-2">#{{ rule.id }}</span>
                    <span>{{ rule.title }}: <strong>{{ rule.amount }} THX</strong></span>

                    <sup v-if="rule.state === 'Active'" class="badge badge-success ml-1">
                        {{ rule.state }}
                    </sup>

                    <sup v-if="rule.state === 'Disabled' " class="badge badge-danger ml-1">
                        {{ rule.state }}
                    </sup>

                    <small class="float-right">
                        {{ rule.created | moment("DD/MM/'YY HH:mm") }}
                    </small>

                </template>

                <div v-if="rule.description" class="alert alert-info">
                    <small>Rule trigger:</small><br>
                    <p>
                        <i>{{ rule.description }}</i>
                    </p>
                    <a class="btn btn-success btn-xs btn-block" :href="`/claim/${pool.address}/${rule.id}`" target="_blank">
                        Claim reward
                    </a>
                </div>

                <div class="alert alert-warning" v-if="!pool.isMember">
                    <strong>You are not a member of this pool and can not join the poll.</strong>
                </div>

                <div class="card card-light" v-if="rule.hasPollAddress && poll">
                    <div class="card-body bg-light">
                        <template v-if="!poll.loading">
                            <div class="alert alert-warning">
                                <small>Rule Change Proposal:</small><br>
                                <del>{{rule.amount}} THX</del> &#x2192; <strong>{{poll.proposedAmount}} THX</strong>
                            </div>

                            <hr class="dotted" />
                            <h3>Total Votes: {{poll.totalVoted}}</h3>
                            <div class="row">
                                <div class="col-12">
                                    <b-progress
                                        variant="info"
                                        :value="((now - poll.startTime) / (poll.endTime - poll.startTime)) * 100"
                                        :max="100"
                                    ></b-progress>
                                </div>
                                <div class="col-6">
                                    <small>{{poll.startTime | moment("MMMM Do YYYY HH:mm") }}</small>
                                </div>
                                <div class="col-6 text-right">
                                    <small>{{poll.endTime | moment("MMMM Do YYYY HH:mm") }}</small>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-12">
                                    <b-progress show-progress :max="(poll.yesCounter + poll.noCounter)">
                                        <b-progress-bar variant="success" :value="poll.yesCounter"></b-progress-bar>
                                        <b-progress-bar variant="danger" :value="poll.noCounter"></b-progress-bar>
                                    </b-progress>
                                </div>
                                <div class="col-6">
                                    <small>{{poll.yesCounter}} THX</small>
                                </div>
                                <div class="col-6 text-right">
                                    <small>{{poll.noCounter}} THX</small>
                                </div>
                            </div>
                        </template>

                        <button v-if="poll" class="btn btn-link btn-block" @click="update()">
                            <span v-if="!poll.loading">Update poll results</span>
                            <div v-else class="d-flex w-100 justify-content-center">
                                <b-spinner variant="dark" ></b-spinner>
                            </div>
                        </button>
                    </div>
                </div>

                <template slot="footer">
                    <template v-if="!rule.hasPollAddress && pool.isMember">
                        <button @click="$refs.modalCreateRulePoll.show()" :class="{ disabled: loading }" class="btn btn-link btn-block">
                            Change reward size
                        </button>
                    </template>
                    <template v-if="rule.hasPollAddress && poll && pool.isMember">
                        <div class="row" v-if="now < poll.endTime">
                            <div class="col-md-6" v-if="!poll.hasVoted">
                                <button @click="vote(true)" :class="{ disabled: poll.loading }" class="btn btn-success btn-block mb-2">
                                    Approve
                                </button>
                            </div>
                            <div class="col-md-6" v-if="!poll.hasVoted">
                                <button @click="vote(false)" :class="{ disabled: poll.loading }" class="btn btn-danger btn-block">
                                    Reject
                                </button>
                            </div>
                            <div class="col-md-12" v-if="poll.hasVoted">
                                <button @click="revokeVote()" :class="{ disabled: poll.loading }" class="btn btn-link btn-block">
                                    Revoke your vote
                                </button>
                            </div>
                        </div>
                        <template v-if="now > poll.endTime">
                            <button @click="tryToFinalize()" :class="{ disabled: loading }" class="btn btn-link btn-block">
                                Finalize Poll
                            </button>
                        </template>
                    </template>

                </template>
            </template>
        </b-card>

        <b-modal ref="modalCreateRulePoll" centered title="Propose new reward size">
            <p>Propose a new reward size for this rule. A poll will be started and members of the pool can vote to approve or reject your proposal over a set amount of time.</p>
            <input v-model="input.poll.proposal" type="number" class="form-control" />
            <template v-slot:modal-footer="{ ok, cancel }">
                <button @click="startRulePoll()" :class="{ disabled: loading }" class="btn btn-primary">
                    Start proposal
                </button>
            </template>
        </b-modal>
    </div>
</template>

<script src="./Rule.ts" lang="ts"></script>
