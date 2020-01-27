<template>
    <div>
        <b-card tag="article"
            footer-tag="footer"
            header-tag="header"
            class="mb-2">

            <div class="text-center" v-if="loading">
                <b-spinner label="Loading..."></b-spinner>
            </div>

            <template v-if="!loading">
                <template slot="header">
                    <span v-if="rule.state === 'Active'" class="badge badge-success float-right">
                        {{ rule.state }}
                    </span>
                    <span v-if="rule.state === 'Disabled' " class="badge badge-danger float-right">
                        {{ rule.state }}
                    </span>
                    <strong>{{ rule.title }}</strong><br>
                    <small>#{{ rule.id }}</small>
                </template>

                <b-card-text>
                    <p>{{ rule.description }}</p>
                    <strong>Reward: {{ rule.amount }} THX</strong>
                </b-card-text>

                <template slot="footer">
                    <div class="justify-content-end d-flex">
                        <button
                            v-if="rule.pollAddress !== '0x0000000000000000000000000000000000000000'"
                            class="btn btn-link"
                            @click="$refs.modalRulePoll.show()">View running poll</button>
                        <button
                            v-if="rule.pollAddress === '0x0000000000000000000000000000000000000000'"
                            class="btn btn-link"
                            @click="$refs.modalCreateRulePoll.show()">Propose reward size</button>
                    </div>
                </template>
            </template>
        </b-card>

        <!-- Make this a component -->
        <b-modal ref="modalRulePoll" centered title="Running Rule Proposal">

            <div class="alert alert-danger" v-if="error">
                {{error}}
            </div>

            <div v-if="poll && poll.loading" class="text-center">
                <b-spinner label="Loading..."></b-spinner>
            </div>

            <div v-if="poll && !poll.loading">

                <div>
                    <h3>{{rule.title}}</h3>
                    <p><i>{{rule.description}}</i></p>
                    <p>
                        Proposal: <del><strong>{{rule.amount}} THX</strong></del> > <strong>{{poll.proposedAmount}} THX</strong>
                    </p>
                    <hr class="dotted">
                    <h3>Poll period:</h3>
                    <div class="row">
                        <div class="col-12">
                            <b-progress
                                variant="info"
                                :value="((now - poll.startTime) / (poll.endTime - poll.startTime)) * 100"
                                :max="100"
                            ></b-progress>
                        </div>
                        <div class="col-6">
                            {{poll.startTime | moment("MMMM Do YYYY HH:mm") }}
                        </div>
                        <div class="col-6 text-right">
                            {{poll.endTime | moment("MMMM Do YYYY HH:mm") }}
                        </div>
                    </div>
                    <hr class="dotted">
                    <h3>Votes ({{poll.totalVoted}})</h3>
                    <div class="row">
                        <div class="col-12">
                            <b-progress show-progress :max="(poll.yesCounter + poll.noCounter)">
                                <b-progress-bar variant="success" :value="poll.yesCounter"></b-progress-bar>
                                <b-progress-bar variant="danger" :value="poll.noCounter"></b-progress-bar>
                            </b-progress>
                        </div>
                        <div class="col-6">
                            {{poll.yesCounter}}
                        </div>
                        <div class="col-6 text-right">
                            {{poll.noCounter}}
                        </div>
                    </div>
                </div>
                <div class="alert alert-warning" v-if="!isMember">
                    <strong>You are not a member of this pool and can not join the poll.</strong>
                </div>
            </div>

            <template v-slot:modal-footer="{ ok, cancel }" v-if="poll && !poll.loading && isMember">
                <template v-if="now > poll.endTime">
                    <button @click="tryToFinalize()" :class="{ disabled: loading }" class="btn btn-primary">
                        Finalize Poll
                    </button>
                </template>
                <template v-if="!poll.hasVoted && now < poll.endTime">
                    <button @click="vote(true)" :class="{ disabled: loading }" class="btn btn-primary">
                        Approve
                    </button>
                    <button @click="vote(false)" :class="{ disabled: loading }" class="btn btn-primary">
                        Reject
                    </button>
                </template>
                <template v-if="poll.hasVoted && now < poll.endTime">
                    <button @click="revokeVote()" :class="{ disabled: loading }" class="btn btn-primary">
                        Revoke
                    </button>
                </template>
            </template>
        </b-modal>

        <b-modal ref="modalCreateRulePoll" centered title="Propose new reward size">
            <div class="text-center" v-if="loading">
                <b-spinner label="Loading..."></b-spinner>
            </div>
            <template v-if="!loading">
                <p>Propose a new reward size for this rule. A poll will be started and members of the pool can vote to approve or reject your proposal over a set amount of time.</p>
                <input v-model="input.poll.proposal" type="number" class="form-control" />
            </template>
            <template v-slot:modal-footer="{ ok, cancel }">
                <button @click="startRulePoll()" :class="{ disabled: loading }" class="btn btn-primary">
                    Start proposal
                </button>
            </template>
        </b-modal>
    </div>
</template>

<script src="./Rule.ts" lang="ts"></script>
