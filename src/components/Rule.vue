<template>
    <BCard
        footer-tag="footer"
        header-tag="header"
        tag="article"
        class="mb-2">

        <template v-if="loading">
            <div class="text-center">
                <BSpinner label="Loading..."></BSpinner>
            </div>
        </template>

        <template v-if="!loading">
            <template slot="header">
                <span v-if="rule.state == 'Active'" class="badge badge-success float-right">{{ rule.state }}</span>
                <span v-if="rule.state == 'Disabled' " class="badge badge-danger float-right">{{ rule.state }}</span>
                <strong>{{meta.title}}</strong><br>
                <small>#{{ rule.id }} {{ rule.slug }}</small>
            </template>

            <BCardText>
                <p>{{meta.description}}</p>
                <strong>Reward: {{ rule.amount }} THX</strong>
            </BCardText>

            <template slot="footer">
                <div class="justify-content-end d-flex">
                    <button
                        v-if="rule.poll !== '0x0000000000000000000000000000000000000000'"
                        class="btn btn-link"
                        @click="showRulePoll()">View running poll</button>
                    <button
                        v-if="rule.poll === '0x0000000000000000000000000000000000000000'"
                        class="btn btn-link"
                        @click="modal.startPoll = true">Propose reward size</button>
                </div>
            </template>
        </template>

        <Modal v-if="modal.rulePoll" @close="modal.rulePoll = false">
            <h3 slot="header">Running Rule Proposal</h3>
            <div slot="body" v-if="!loading">
                <div class="alert alert-danger" v-if="alert.noVote">
                    <strong>A problem occured while processing your vote or revoke request. Verify that the voting period did not end.</strong>
                </div>
                <div v-if="poll">
                    <h3>{{meta.title}}</h3>
                    <p><i>{{meta.description}}</i></p>
                    <p>
                        Proposal: <del><strong>{{poll.amount}} THX</strong></del> > <strong>{{poll.proposedAmount}} THX</strong>
                    </p>
                    <hr class="dotted">
                    <h3>Poll period:</h3>
                    <div class="row">
                        <div class="col-12">
                            <BProgress
                                variant="info"
                                :value="((poll.now - poll.startTime) / (poll.endTime - poll.startTime)) * 100"
                                :max="100"
                            ></BProgress>
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
                            <BProgress show-progress :max="(poll.yesCounter + poll.noCounter)">
                                <BProgressBar variant="success" :value="poll.yesCounter"></BProgressBar>
                                <BProgressBar variant="danger" :value="poll.noCounter"></BProgressBar>
                            </BProgress>
                        </div>
                        <div class="col-6">
                            {{poll.yesCounter}}
                        </div>
                        <div class="col-6 text-right">
                            {{poll.noCounter}}
                        </div>
                    </div>
                </div>
                <div class="alert alert-warning" v-if="!account.isMember">
                    <strong>You are not a member of this pool and can not join the poll.</strong>
                </div>
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer" v-if="poll && account.isMember">
                <div class="row" v-if="poll.now > poll.endTime">
                    <div class="col-12">
                        <button @click="finalizePoll()" v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block">Finalize Poll</button>
                    </div>
                </div>
                <div class="row" v-if="!poll.hasVoted && poll.now < poll.endTime">
                    <div class="col-6">
                        <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" @click="vote(true)">Approve</button>
                    </div>
                    <div class="col-6">
                        <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" @click="vote(false)">Reject</button>
                    </div>
                </div>
                <div class="row" v-if="poll.hasVoted && poll.now < poll.endTime">
                    <div class="col-12">
                        <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" @click="revokeVote()">Revoke</button>
                    </div>
                </div>
            </template>
        </Modal>

        <Modal v-if="modal.startPoll" @close="modal.startPoll = false">
            <h3 slot="header">Propose new reward size</h3>
            <p>Propose a new reward size for this rule. A poll will be started and members of the pool can vote to approve or reject your proposal over a set amount of time.</p>
            <div slot="body" v-if="!loading">
                <input v-model="input.proposedAmount" type="number" class="form-control" />
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="startPoll()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Start proposal</button>
            </template>
        </Modal>

    </BCard>

</template>

<script src="./Rule.ts"></script>
