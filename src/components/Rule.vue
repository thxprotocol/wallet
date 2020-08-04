<template>
    <div class="mb-2 w-100">
        <b-card
            v-on:updatePoll="poll = $event"
            tag="article"
            :no-body="!showDetails"
            footer-tag="footer"
            header-tag="header"
            class="mb-2 w-100"
        >
            <div class="alert alert-danger" v-if="error">{{ error }}</div>

            <template v-if="!rule.loading">
                <button
                    slot="header"
                    class="btn p-0 w-100 border-0"
                    @click="showDetails = !showDetails"
                >
                    <div class="position-absolute" style="top: 0.5rem; right: 0.5rem;">
                        <small
                            class="badge badge-xs"
                            :class="{
                                'badge-success': rule.state === 'Active',
                                'badge-danger': rule.state === 'Disabled',
                                'badge-light': rule.state !== 'Active' && rule.state !== 'Disabled',
                            }"
                        >{{ rule.state }}</small>
                    </div>
                    <div class="text-light bg-blue text-center pt-3 pb-3">
                        <span class="font-size-l">{{ rule.amount }} THX</span>
                    </div>
                </button>

                <template v-if="showDetails">
                    <div class="mb-0">
                        <strong>#{{ rule.id }} | {{ rule.title }}</strong>
                    </div>
                    <small
                        class="text-muted m-0"
                    >Created: {{ rule.created | moment("DD/MM/'YY HH:mm") }}</small>
                    <p v-if="rule.description">
                        <i>{{ rule.description }}</i>
                    </p>

                    <!-- <button class="btn btn-sm btn-secondary btn-block" v-b-modal="'modalRewardClaim'">
                        Claim reward
                    </button>

                    <button class="btn btn-sm btn-secondary btn-block" v-b-modal="'modalRewardGive'">
                        Give reward
                    </button>-->

                    <div v-if="!pool.isMember" class="alert alert-warning mb-0 mt-3">
                        <strong>You are not a member of this pool and can not join the poll.</strong>
                    </div>

                    <template v-if="rule.hasPollAddress && rule.poll">
                        <hr class="dotted" />
                        <div class="position-relative" :class="{ disabled: rule.poll.loading }">
                            <b-overlay :show="rule.poll.loading" no-wrap></b-overlay>
                            <div class="alert alert-warning">
                                <small>Rule Change Proposal:</small>
                                <br />
                                <del>{{ rule.amount }} THX</del> &#x2192;
                                <strong>{{ rule.poll.proposedAmount }} THX</strong>
                            </div>
                            <base-poll
                                v-if="rule.poll"
                                @start="$timer.start('update')"
                                :now="now"
                                :poll="rule.poll"
                            />
                        </div>
                    </template>
                </template>

                <template slot="footer">
                    <template v-if="!rule.hasPollAddress && pool.isMember">
                        <button
                            v-b-modal="'modalRulePollCreate'"
                            :class="{ disabled: rule.loading }"
                            class="btn btn-link btn-block"
                        >Change reward size</button>
                    </template>
                    <template v-if="rule.hasPollAddress && rule.poll && pool.isMember">
                        <div class="row" v-if="now < rule.poll.endTime">
                            <div class="col-md-6" v-if="!rule.poll.hasVoted">
                                <button
                                    @click="vote(true)"
                                    :class="{ disabled: rule.poll.loading }"
                                    class="btn btn-success btn-block mb-2"
                                >Approve</button>
                            </div>
                            <div class="col-md-6" v-if="!rule.poll.hasVoted">
                                <button
                                    @click="vote(false)"
                                    :class="{ disabled: rule.poll.loading }"
                                    class="btn btn-danger btn-block"
                                >Reject</button>
                            </div>
                            <div class="col-md-12" v-if="rule.poll.hasVoted">
                                <button
                                    @click="revokeVote()"
                                    :class="{ disabled: rule.poll.loading }"
                                    class="btn btn-link btn-block"
                                >Revoke your vote</button>
                            </div>
                        </div>
                        <template v-if="now > rule.poll.endTime">
                            <button
                                @click="tryToFinalize()"
                                :class="{ disabled: rule.loading }"
                                class="btn btn-link btn-block"
                            >Finalize Poll</button>
                        </template>
                    </template>
                </template>
            </template>
        </b-card>

        <modal-reward-give :rule="rule" :pool="pool" />
        <modal-reward-claim :rule="rule" :pool="pool" />
        <modal-rule-poll-create :rule="rule" :pool="pool" :poll="rule.poll" />
    </div>
</template>

<script src="./Rule.ts" lang="ts"></script>
