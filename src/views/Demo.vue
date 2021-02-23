<template>
    <div class="w-100 h-100 bg-light center-center">
        <div class="card" v-if="!submitted">
            <div class="card-header">Demo Pool: Volunteers United</div>
            <div class="card-body">
                <div class="form-group">
                    <b-form-input :state="isValidAddress" v-model="address" placeholder="Enter member address" />
                </div>
                <b-button block variant="primary" :disabled="!isValidAddress" @click="submit()">
                    <span v-if="!busy">Enter Pool</span>
                    <b-spinner small variant="dark" v-else />
                </b-button>
            </div>
        </div>
        <div v-if="submitted" class="row">
            <div class="col-md-5">
                <div class="card">
                    <div class="card-body">
                        <h2 class="h4 text-center">SCAN</h2>
                        <p>And claim the reward for your account and withdraw it from your wallet.</p>
                        <p class="text-center"><img :src="qr" alt="QR Code" /></p>
                    </div>
                </div>
            </div>
            <div class="col-md-2 text-center font-weight-bold center-center">
                <span class="m-5">OR</span>
            </div>
            <div class="col-md-5">
                <div class="card">
                    <div class="card-body">
                        <h2 class="h4 text-center">GIVE</h2>
                        <p>Enter any other member address or yourself and give a reward from the pool.</p>
                        <b-form-input :state="isValidTargetAddress" v-model="targetAddress" placeholder="0x..." />
                        <hr />
                        <b-button block variant="primary" @click="give()">
                            <span v-if="!busy">Give reward from pool</span>
                            <b-spinner small variant="dark" v-else />
                        </b-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    BAlert,
    BBadge,
    BButton,
    BFormInput,
    BInputGroup,
    BInputGroupAppend,
    BListGroup,
    BListGroupItem,
    BSpinner,
} from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';
import { ethers } from 'ethers';

@Component({
    name: 'AccountView',
    components: {
        'b-button': BButton,
        'b-badge': BBadge,
        'b-alert': BAlert,
        'b-spinner': BSpinner,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
        'b-form-input': BFormInput,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
})
export default class DemoView extends Vue {
    error = '';
    qr = '';
    poolAddress = process.env.VUE_APP_DEMO_ASSET_POOL_ADDRESS || '';
    address = '';
    targetAddress = '';
    token = '';
    busy = false;
    submitted = false;

    get isValid() {
        return this.address.length && this.poolAddress.length;
    }

    get isValidTargetAddress() {
        if (!this.targetAddress.length) {
            return null;
        }

        return ethers.utils.isAddress(this.targetAddress);
    }

    get isValidAddress() {
        if (!this.address.length) {
            return null;
        }

        return ethers.utils.isAddress(this.address);
    }

    async give() {
        if (!this.isValid) {
            return;
        }
        this.busy = true;
        try {
            await this.giveReward(1, this.targetAddress, this.poolAddress);
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }

    async submit() {
        if (!this.isValid) {
            return;
        }
        try {
            this.busy = true;

            await this.getToken();
            const isMember = await this.getMember(this.address, this.poolAddress);

            if (!isMember) {
                await this.addMember(this.address, this.poolAddress);
            }
            this.submitted = true;

            this.qr = await this.getQR(1, this.poolAddress);
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }

    async getQR(id: number, poolAddress: string) {
        try {
            const reqReward = await axios({
                method: 'POST',
                url: `/rewards/${id}/claim`,
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    AssetPool: poolAddress,
                },
            });
            return reqReward.data.base64;
        } catch (e) {
            this.error = e.toString();
        }
    }

    async giveReward(id: number, address: string, poolAddress: string) {
        try {
            const reqReward = await axios({
                method: 'POST',
                url: `/rewards/${id}/give`,
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    AssetPool: poolAddress,
                },
                data: {
                    member: address,
                },
            });
            return reqReward.data.base64;
        } catch (e) {
            this.error = e.toString();
        }
    }

    async getMember(address: string, poolAddress: string) {
        try {
            const reqMember = await axios({
                method: 'GET',
                url: '/members/' + address,
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    AssetPool: poolAddress,
                },
            });
            return reqMember.data.isMember;
        } catch (e) {
            this.error = e.toString();
        }
    }

    async addMember(address: string, poolAddress: string) {
        try {
            const reqMember = await axios({
                method: 'POST',
                url: '/members',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    AssetPool: poolAddress,
                },
                data: {
                    address,
                },
            });
            return reqMember.data;
        } catch (e) {
            this.error = e.toString();
        }
    }

    async getToken() {
        try {
            const authHeader = new Buffer(
                `${process.env.VUE_APP_DEMO_OIDC_CLIENT_ID}:${process.env.VUE_APP_DEMO_OIDC_CLIENT_SECRET}`,
            ).toString('base64');

            const data = new URLSearchParams();
            data.append('grant_type', 'client_credentials');
            data.append('scope', 'openid admin');

            const r = await axios({
                method: 'POST',
                url: process.env.VUE_APP_API_ROOT + '/token',
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`,
                },
                data,
            });
            this.token = r.data.access_token;
        } catch (e) {
            this.error = e.toString();
        }
    }
}
</script>
