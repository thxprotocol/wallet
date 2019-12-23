<template>
<article class="region region-container overflow">

    <div v-if="notifications.length == 0" class="d-flex w-100 h-100 align-items-center justify-content-center">
        <BSpinner variant="light" label="Loading..."></BSpinner>
    </div>

    <BCard
        v-bind:key="n.id"
        v-for="n in notifications"
        header-tag="header"
        footer-tag="footer"
        tag="article"
        class="mb-2"
        style="margin: 1rem; width: 100%">

        <template slot="header">
            <div class="d-flex w-100 align-items-center">
                <div>
                    <ProfilePicture class="mr-3" size="sm" :uid="n.user.uid"></ProfilePicture>
                </div>
                <div style="flex: 1;">
                    <span><strong>{{n.user.firstName}}</strong> claimed <strong>{{ n.amount}} THX</strong> as a reward for the rule <strong>{{ n.slug }}</strong>.</span>
                </div>
                <div>
                    <span class="badge badge-success float-right">{{n.state}}</span>
                </div>
            </div>
        </template>

        <BCardText>
            <p>
                {{ n.pool.name }} <strong>[{{ n.pool.balance }} THX]</strong><br>
                <small>{{ n.created | moment('MMMM Do YYYY HH:mm') }}</small>
            </p>
            <hr class="dotted" />

            <div v-if="n.poll">
                <h3>Poll period:</h3>
                <div class="row">
                    <div class="col-12">
                        <BProgress
                            variant="info"
                            :value="((n.poll.now - n.poll.startTime) / (n.poll.endTime - n.poll.startTime)) * 100"
                            :max="100"
                        ></BProgress>
                    </div>
                    <div class="col-6">
                        {{n.poll.startTime | moment("MMMM Do YYYY HH:mm") }}
                    </div>
                    <div class="col-6 text-right">
                        {{n.poll.endTime | moment("MMMM Do YYYY HH:mm") }}
                    </div>
                </div>
                <hr class="dotted">
                <h3>Votes ({{n.poll.totalVoted}})</h3>
                <div class="row">
                    <div class="col-12">
                        <BProgress show-progress :max="(n.poll.yesCounter + n.poll.noCounter)">
                            <BProgressBar variant="success" :value="n.poll.yesCounter"></BProgressBar>
                            <BProgressBar variant="danger" :value="n.poll.noCounter"></BProgressBar>
                        </BProgress>
                    </div>
                    <div class="col-6">
                        {{n.poll.yesCounter}}
                    </div>
                    <div class="col-6 text-right">
                        {{n.poll.noCounter}}
                    </div>
                </div>
            </div>
        </BCardText>

        <template slot="footer">
            <div class="row" v-if="!n.hasVoted && n.poll.now < n.poll.endTime">
                <div class="col-6">
                    <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" v-on:click="vote(n.id, true, n.pool.address)">
                        Approve
                    </button>
                </div>
                <div class="col-6">
                    <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" v-on:click="vote(n.id, false, n.pool.address)">
                        Reject
                    </button>
                </div>
            </div>
            <div class="row" v-if="n.hasVoted && n.poll.now < n.poll.endTime">
                <div class="col-12">
                    <button v-bind:class="{ disabled: loading }" class="btn btn-primary btn-block" v-on:click="revokeVote(n.id, n.pool.address)">
                        Revoke Vote
                    </button>
                </div>
            </div>
        </template>

    </BCard>

</article>
</template>

<script src="./Notifications.ts"></script>
