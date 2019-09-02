<template>
    <tr>
        <td>
            {{ reward.id }}
        </td>
        <td>
            {{ reward.slug }}
        </td>
        <td>
            {{ reward.amount }}
        </td>
        <td>
            <button class="btn btn-link" @click="onFinalizeReward(reward.id)">Finalize Poll</button>
        </td>
        <td>
            <strong>{{ reward.state }}</strong>
        </td>
    </tr>
</template>

<script>
import Vue from 'vue';
import modal from '../components/Modal';

import { BSpinner, BProgress, BProgressBar } from 'bootstrap-vue';

export default {
    name: 'Reward',
    components: {
        modal,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
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

    }
}
</script>
