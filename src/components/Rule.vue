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
            <div v-if="loading" class="text-center">
                <b-spinner label="Loading..."></b-spinner>
            </div>
            <div v-if="!loading">

                <div class="alert alert-danger" v-if="error">
                    {{error}}
                </div>

                <div v-if="rule.poll">
                    <h3>{{rule.title}}</h3>
                    <p><i>{{rule.description}}</i></p>
                    <p>
                        Proposal: <del><strong>{{rule.amount}} THX</strong></del> > <strong>{{rule.poll.proposedAmount}} THX</strong>
                    </p>
                    <hr class="dotted">
                    <h3>Poll period:</h3>
                    <div class="row">
                        <div class="col-12">
                            <b-progress
                                variant="info"
                                :value="((now - rule.poll.startTime) / (rule.poll.endTime - rule.poll.startTime)) * 100"
                                :max="100"
                            ></b-progress>
                        </div>
                        <div class="col-6">
                            {{rule.poll.startTime | moment("MMMM Do YYYY HH:mm") }}
                        </div>
                        <div class="col-6 text-right">
                            {{rule.poll.endTime | moment("MMMM Do YYYY HH:mm") }}
                        </div>
                    </div>
                    <hr class="dotted">
                    <h3>Votes ({{rule.poll.totalVoted}})</h3>
                    <div class="row">
                        <div class="col-12">
                            <b-progress show-progress :max="(rule.poll.yesCounter + rule.poll.noCounter)">
                                <b-progress-bar variant="success" :value="rule.poll.yesCounter"></b-progress-bar>
                                <b-progress-bar variant="danger" :value="rule.poll.noCounter"></b-progress-bar>
                            </b-progress>
                        </div>
                        <div class="col-6">
                            {{rule.poll.yesCounter}}
                        </div>
                        <div class="col-6 text-right">
                            {{rule.poll.noCounter}}
                        </div>
                    </div>
                </div>
                <div class="alert alert-warning" v-if="!isMember">
                    <strong>You are not a member of this pool and can not join the poll.</strong>
                </div>
            </div>
            <p v-if="rule.poll">
                isMember: {{isMember}}<br>
                now: {{now}}<br>
                endTime: {{rule.poll.endTime}}<br>
                startTime: {{rule.poll.startTime}}<br>
                hasVoted: {{rule.poll.hasVoted}}<br>
            </p>

            <template v-slot:modal-footer="{ ok, cancel }" v-if="rule.poll && isMember">
                <div class="row" v-if="now > rule.poll.endTime">
                    <div class="col-12">
                        <button @click="tryToFinalize()" :class="{ disabled: loading }" class="btn btn-primary btn-block">Finalize Poll</button>
                    </div>
                </div>
                <div class="row" v-if="!rule.poll.hasVoted && now < rule.poll.endTime">
                    <div class="col-6">
                        <button :class="{ disabled: loading }" class="btn btn-primary btn-block" @click="vote(true)">Approve</button>
                    </div>
                    <div class="col-6">
                        <button :class="{ disabled: loading }" class="btn btn-primary btn-block" @click="vote(false)">Reject</button>
                    </div>
                </div>
                <div class="row" v-if="rule.poll.hasVoted && now < rule.poll.endTime">
                    <div class="col-12">
                        <button :class="{ disabled: loading }" class="btn btn-primary btn-block" @click="revokeVote()">Revoke</button>
                    </div>
                </div>
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
