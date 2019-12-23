<template>
    <article>
        <BListGroupItem>
            <div class="d-flex w-100 align-items-center">
                <div>
                    <ProfilePicture class="mr-3" size="sm" :uid="reward.user.uid"></ProfilePicture>
                </div>
                <div style="flex: 1;">
                    <span><strong>{{reward.user.firstName}}</strong> claimed <strong>{{ reward.amount}} THX</strong> as a reward for the rule <strong>{{ reward.slug }}</strong>.</span>
                </div>
                <div>
                    <span :class="`badge badge-${reward.state == 'Approved' ? 'success' : reward.state == 'Rejected' ? 'danger' : 'info'} float-right`">{{reward.state}}</span>
                </div>
            </div>
            <div class="row mb-2 mt-4">
                <div class="col-12">
                    <BProgress
                        variant="info"
                        :value="((reward.now - reward.startTime) / (reward.endTime - reward.startTime)) * 100"
                        :max="100"
                    ></BProgress>
                </div>
                <div class="col-6">
                    <small>{{reward.startTime | moment("MMMM Do YYYY HH:mm") }}</small>
                </div>
                <div class="col-6 text-right">
                    <small>{{reward.endTime | moment("MMMM Do YYYY HH:mm") }}</small>
                </div>
            </div>
            <div class="d-flex w-100 justify-content-end">
                <button v-if="reward.beneficiary === account.loom.address && reward.now > reward.endTime && reward.state === 'Pending'" class="btn btn-primary btn-block mt-1" @click="finalizePoll()">Finalize Poll</button>
                <button v-if="reward.beneficiary === account.loom.address && reward.now > reward.endTime && reward.state === 'Approved'" class="btn btn-primary btn-block mt-1" @click="withdraw()">Withdraw {{reward.amount}} THX</button>
            </div>
        </BListGroupItem>
    </article>
</template>

<script src="./Reward.ts" lang="ts"></script>
