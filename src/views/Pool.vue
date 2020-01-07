<template>
    <article class="region region-container">
        <main class="region region-content" v-if="pool">
            <div class="region region-jumbotron" >
                <strong class="font-size-xl">{{pool.balance}} THX</strong>
                <p>{{ pool.name }}</p>
            </div>

            <div class="row">
                <div class="col-12">
                    <b-tabs content-class="mt-4" justified>
                        <div class="alert alert-danger" v-if="error">
                            {{error}}
                        </div>
                        <b-tab title="Stream" active>

                            <div class="text-center" v-if="loading">
                                <b-spinner label="Loading..."></b-spinner>
                            </div>

                            <b-list-group v-if="!loading">
                                <component
                                    v-for="(ev, key) in stream"
                                    :key="key"
                                    :ev="ev"
                                    :is="ev.component"  />
                            </b-list-group>

                        </b-tab>

                        <b-tab title="Rules">

                            <!-- <Rules v-if="contract && account" v-bind:contract="contract" v-bind:account="account"></Rules> -->

                        </b-tab>

                        <b-tab title="Rewards">

                            <!-- <Rewards v-if="contract && account" v-bind:contract="contract" v-bind:account="account"></Rewards> -->

                        </b-tab>

                        <b-tab title="Actions">
                            <ul class="list-bullets">
                                <li v-if="isManager">
                                    <button class="btn btn-link" @click="$refs.modalAddManager.show()">Add Manager</button>
                                </li>
                                <li v-if="isMember">
                                    <button class="btn btn-link" @click="$refs.modalAddMember.show()">Invite Member</button>
                                </li>
                                <li>
                                    <button class="btn btn-link" @click="$refs.modalDeposit.show()">Pool Deposit</button>
                                </li>
                            </ul>
                        </b-tab>
                    </b-tabs>
                </div>
            </div>

            <b-modal ref="modalAddMember" centered title="Invite a member for this reward pool">
                <input v-if="!loading" v-model="input.addMember" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                <p v-if="loading" class="d-flex w-100 justify-content-center">
                    <b-spinner></b-spinner>
                </p>
                <template v-slot:modal-footer="{ ok, cancel }">
                    <button class="btn btn-link" @click="$refs.modalAddMember.hide()">
                        Cancel
                    </button>
                    <button @click="addMember()" v-bind:class="{ disabled: loading }" class="btn btn-primary">
                        Add Member
                    </button>
                </template>
            </b-modal>

            <b-modal ref="modalAddManager" centered title="Add a manager to the reward pool">
                <input v-if="!loading" v-model="input.addManager" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                <p v-if="loading" class="d-flex w-100 justify-content-center">
                    <b-spinner></b-spinner>
                </p>
                <template v-slot:modal-footer="{ ok, cancel }">
                    <button class="btn btn-link" @click="$refs.modalAddManager.hide()">
                        Cancel
                    </button>
                    <button @click="addManager()" v-bind:class="{ disabled: loading }" class="btn btn-primary">
                        Add Manager
                    </button>
                </template>
            </b-modal>

            <b-modal ref="modalAddManager" centered title="Add a manager to the reward pool">
                <input v-if="!loading" v-model="input.addManager" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                <p v-if="loading" class="d-flex w-100 justify-content-center">
                    <b-spinner></b-spinner>
                </p>
                <template v-slot:modal-footer="{ ok, cancel }">
                    <button class="btn btn-link" @click="$refs.modalAddManager.hide()">
                        Cancel
                    </button>
                    <button @click="addManager()" v-bind:class="{ disabled: loading }" class="btn btn-primary">
                        Add Manager
                    </button>
                </template>
            </b-modal>

            <b-modal ref="modalDeposit" centered title="Deposit THX to the reward pool">
                <p>Reward Pool balance: <strong>{{this.pool.balance}} THX</strong></p>
                <input v-if="!loading" v-model="input.poolDeposit" type="number" class="form-control" />
                <p v-if="loading" class="d-flex w-100 justify-content-center">
                    <b-spinner></b-spinner>
                </p>
                <template v-slot:modal-footer="{ ok, cancel }">
                    <button class="btn btn-link" @click="$refs.modalDeposit.hide()">
                        Cancel
                    </button>
                    <button @click="deposit()" v-bind:class="{ disabled: loading }" class="btn btn-primary">
                        Deposit {{ input.poolDeposit }} THX
                    </button>
                </template>
            </b-modal>

        </main>
    </article>
</template>

<script src="./Pool.ts" lang="ts"></script>
