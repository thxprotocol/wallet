<template>
    <article>
        <BListGroupItem>
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="mr-2">
                    <ProfilePicture size="sm" :uid="reward.user.uid"></ProfilePicture>
                </div>
                <div>
                    <strong>{{reward.user.firstName}} claims {{ reward.amount}} THX as a reward for the rule {{ reward.slug }}.</strong>
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
                <button v-if="reward.beneficiary == account.loom.address" class="btn btn-primary btn-block mt-1" @click="claim()">Claim your THX!</button>
            </div>
        </BListGroupItem>
    </article>
</template>

<script>
import ProfilePicture from '../components/ProfilePicture';
import { BProgress, BListGroupItem } from 'bootstrap-vue';

export default {
    name: 'Reward',
    components: {
        BProgress,
        BListGroupItem,
        ProfilePicture,
    },
    data: function() {
        return {
            loading: false,
        }
    },
    props: {
        reward: null,
        contract: null,
        account: {
            loom: {
                address: ''
            }
        }
    },
    mounted() {

    },
    methods: {
        async claim() {
            const THX = window.THX;

            this.loading = true;

            await this.finalizePoll();

            return await this.reward.contract.methods.withdraw()
                .send({ from: THX.network.account.address })
                .then(async tx => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.log(tx);
                })
                .catch(err => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.error(err);
                })
        },
        async finalizePoll() {
            const THX = window.THX;

            this.loading = true;

            return await this.reward.contract.methods.tryToFinalize()
                .send({ from: THX.network.account.address })
                .then(async tx => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.log(tx);
                })
                .catch(err => {
                    this.loading = false;
                    // eslint-disable-next-line
                    console.error(err);
                })
        },
    }
}
</script>
