<template>
    <article class="region region-container">
        <main class="region region-content">
            <div class="region region-jumbotron" v-if="pool">
                <strong class="font-size-xl">{{pool.balance}} THX</strong>
                <p>{{ pool.name }}</p>
            </div>

            <div class="row">
                <div class="col-12">
                    <BTabs content-class="mt-4" justified>
                        <div class="alert alert-danger" v-if="error">
                            {{error}}
                        </div>
                        <BTab title="Stream" active>

                            <div class="text-center" v-if="!orderedStream.length">
                                <BSpinner label="Loading..."></BSpinner>
                            </div>

                            <BListGroup v-if="orderedStream">
                                <BListGroupItem v-bind:key="transfer.key" v-for="transfer in orderedStream" variant="transfer.variant">
                                    <div class="d-flex w-100 justify-content-between">
                                        <strong v-bind:class="`text-${transfer.variant}`">{{transfer.title}}</strong>
                                        <small>{{ transfer.timestamp | moment("MMMM Do YYYY HH:mm") }}</small>
                                    </div>
                                    <small class="mb-1">{{transfer.body}}</small>
                                </BListGroupItem>
                            </BListGroup>

                        </BTab>

                        <BTab title="Rules">

                            <!-- <Rules v-if="contract && account" v-bind:contract="contract" v-bind:account="account"></Rules> -->

                        </BTab>

                        <BTab title="Rewards">

                            <!-- <Rewards v-if="contract && account" v-bind:contract="contract" v-bind:account="account"></Rewards> -->

                        </BTab>

                        <BTab title="Actions">
                            <ul class="list-bullets">
                                <li v-if="isManager">
                                    <button class="btn btn-link" @click="modal.addManager = true">Add Manager</button>
                                </li>
                                <li v-if="isMember">
                                    <button class="btn btn-link" @click="modal.addMember = true">Invite Member</button>
                                </li>
                                <li>
                                    <button class="btn btn-link" @click="modal.poolDeposit = true">Pool Deposit</button>
                                </li>
                            </ul>
                        </BTab>
                    </BTabs>
                </div>
            </div>

            <Modal v-if="modal.addMember" @close="modal.addMember = false">
                <h3 slot="header">Invite new member to the pool:</h3>
                <div slot="body">
                    <input v-if="!loading" v-model="input.addMember" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                    <p v-if="loading" class="d-flex w-100 justify-content-center">
                        <BSpinner></BSpinner>
                    </p>
                </div>
                <template slot="footer">
                    <button @click="onAddMember()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Add member</button>
                </template>
            </Modal>

            <Modal v-if="modal.addManager" @close="modal.addManager = false">
                <h3 slot="header">Add a manager for this pool:</h3>
                <div slot="body">
                    <input v-if="!loading" v-model="input.addManager" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                    <p v-if="loading" class="d-flex w-100 justify-content-center">
                        <BSpinner></BSpinner>
                    </p>
                </div>
                <template slot="footer">
                    <button @click="onAddManager()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Add manager</button>
                </template>
            </Modal>

            <Modal v-if="modal.poolDeposit" @close="modal.poolDeposit = false">
                <h3 slot="header">Reward pool deposit:</h3>
                <div slot="body">
                    <p>Reward Pool balance: <strong>{{this.pool.balance}} THX</strong></p>
                    <input v-if="!loading" v-model="input.poolDeposit" type="number" class="form-control" />
                    <p v-if="loading" class="d-flex w-100 justify-content-center">
                        <BSpinner></BSpinner>
                    </p>
                </div>
                <template slot="footer">
                    <button @click="onTransferToPool()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Deposit {{ input.poolDeposit }} THX</button>
                </template>
            </Modal>

        </main>
    </article>
</template>

<script src="./Pool.ts" lang="ts"></script>
