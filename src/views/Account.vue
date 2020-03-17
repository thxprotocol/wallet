<template>
<article class="region region-container">
    <main class="region region-content">

        <h2>{{account.firstName}} {{account.lastName}}</h2>

        <b-alert v-if="alert" show :variant="alert.variant ? alert.variant : 'info'">
          {{ alert.text }}
        </b-alert>

        <div class="card mb-3">
            <div class="card-body" v-if="account">
                <span v-if="!account.picture" class="float-right ml-3">
                    <label class="text-center">
                        <div class="account-picture account-picture-sm bg-yellow">
                            <span>
                                {{ account.initials}}
                            </span>
                        </div><br>
                        <span class="btn btn-link">Change</span>
                        <input type="file" @change="onFileChange" class="d-none">
                    </label>
                </span>
                <span v-if="account.picture" class="float-right ml-3 text-center">
                    <div class="account-picture account-picture-sm bg-yellow">
                        <img :src="account.picture.url"
                            :alt="account.picture.name"
                            width="100%"
                            height="100%"
                            class="rounded-circle" />
                    </div><br>
                    <button class="btn btn-link" @click="removeImage">Delete</button>
                </span>

                <h3>E-mail:</h3>
                <p>{{account.email}}</p>

                <h3>UID:</h3>
                <p>{{account.uid}}</p>

                <template v-if="account.slack">
                    <h3>Slack:</h3>
                    {{account.slack}}
                </template>
            </div>
            <div class="card-footer">
                <button class="btn btn-link btn-block" @click="showModal('modal-connect')">Connect Accounts</button>
            </div>
        </div>

        <div class="card mb-3" v-if="$network.rinkeby && $network.rinkeby.account">
            <div class="card-header pl-3 pr-3 pt-2 pb-2">
                <div>
                    <strong>Rinkeby Network</strong><br>
                    <small>{{$network.rinkeby.account.address}} <a class="text-primary" @click="copyClipboard($network.rinkeby.account.address)">({{clipboard === $network.rinkeby.account.address ? 'Copied!' : 'Copy'}})</a></small>
                </div>
            </div>
            <div class="card-body">
                <ul class="list-bullets">
                    <li><button class="btn btn-link" @click="showModal('modal-gateway-deposit')">Deposit THX</button></li>
                    <li><button class="btn btn-link" @click="showModal('modal-transfer-coin-rinkeby')">Transfer THX</button></li>
                    <li><button class="btn btn-link" @click="showModal('modal-transfer-ether')">Transfer ETH</button></li>
                    <li v-if="isRinkebyMinter"><button class="btn btn-link" @click="showModal('modal-add-minter')">Add minter role</button></li>
                    <li v-if="isRinkebyMinter"><button class="btn btn-link" @click="showModal('modal-mint-rinkeby')">Mint tokens</button></li>
                </ul>
            </div>
        </div>

        <div class="card mb-3" v-if="$network.extdev && $network.extdev.account">
            <div class="card-header pl-3 pr-3 pt-2 pb-2">
                <div>
                    <strong>Loom Network</strong><br />
                    <small>{{$network.extdev.account}}
                        <a class="text-primary" @click="copyClipboard($network.extdev.account)">
                            ({{clipboard === $network.extdev.account ? 'Copied!' : 'Copy'}})
                        </a>
                    </small>
                </div>
            </div>
            <div class="card-body">
                <ul class="list-bullets">
                    <li><button class="btn btn-link" @click="showModal('modal-gateway-withdraw')">Withdraw THX</button></li>
                    <li><button class="btn btn-link" @click="showModal('modal-transfer-coin-extdev')">Transfer THX</button></li>
                    <li v-if="isExtdevMinter"><button class="btn btn-link" @click="showModal('modal-mint-extdev')">Mint tokens</button></li>
                </ul>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <button @click="reset()" class="btn btn-link mr-2">Reset</button>
            <button @click="logout()" class="btn btn-primary">Logout</button>
        </div>

        <b-modal title="Connect accounts" centered ref="modal-connect">
            <p>Add private keys for the loom sidechain and the parent Rinkeby network. These keys will only be stored on your device and used to verify transactions.</p>
            <div class="alert alert-warning"><strong>Make sure to store your private keys safely and not only on this device. We can not recover your keys!</strong></div>
            <div class="form-group">
                <label>Loom private key:</label>
                <div class="input-group">
                    <input v-model="input.extdevPrivateKey" type="text" class="form-control" placeholder="Paste or create your Loom private key">
                    <div class="input-group-append">
                        <span @click="createExtdevKey()" class="input-group-text btn btn-link">Create new key</span>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Rinkeby private key:</label>
                <div class="input-group">
                    <input v-model="input.rinkebyPrivateKey" type="text" class="form-control" placeholder="Paste or create your Rinkeby private key">
                    <div class="input-group-append">
                        <span @click="createRinkebyKey()" class="input-group-text btn btn-link">Create new key</span>
                    </div>
                </div>
            </div>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onCreateAccountsFromPrivateKey()">Connect</b-button>
            </template>
        </b-modal>

        <b-modal title="Add minter role" centered ref="modal-add-minter">
            <template v-if="!loading">
                <input v-model="input.newMinterAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </template>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onAddMinter()">Connect Accounts</b-button>
            </template>
        </b-modal>

        <b-modal title="Mint tokens for Rinkeby account" centered ref="modal-mint-rinkeby">

            <template v-if="!loading" >
                <input v-model="input.mintForAccount" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </template>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onMintRinkebyCoin()">Mint {{ input.mintForAccount }} THX </b-button>
            </template>
        </b-modal>

        <b-modal title="Mint tokens for Loom account" centered ref="modal-mint-extdev">

            <template v-if="!loading">
                <input v-model="input.mintForLoomAccount" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </template>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onMintExtdevCoin()">Mint {{ input.mintForLoomAccount }} THX </b-button>
            </template>

        </b-modal>

        <b-modal title="Deposit THX" centered ref="modal-gateway-deposit">

            <template v-if="!loading">
                <input v-model="input.depositToGateway" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </template>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onDeposit()">Deposit {{ input.depositToGateway }} THX </b-button>
            </template>
        </b-modal>

        <b-modal title="Withdraw THX" centered ref="modal-gateway-withdraw">

            <template v-if="!loading">
                <input v-model="input.withdrawToGateway" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </template>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onWithdraw()">Withdraw {{ input.withdrawToGateway }} THX </b-button>
            </template>
        </b-modal>

        <b-modal title="Transfer THX on Extdev" centered ref="modal-transfer-coin-extdev">

            <template v-if="!loading">
                <div class="form-group">
                    <input v-model="input.transferTokensAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000" />
                </div>
                <div class="form-group">
                    <input v-model="input.transferTokens" type="number" class="form-control"  v-bind:max="$store.state.balance.token" />
                </div>
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </template>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onTransferExtdevCoin()">Transfer {{ input.transferTokens }} THX</b-button>
            </template>
        </b-modal>

        <b-modal title="Transfer THX on Rinkeby" centered ref="modal-transfer-coin-rinkeby">

            <template v-if="!loading">
                <div class="form-group">
                    <input v-model="input.transferRinkebyCoinAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000" />
                </div>
                <div class="form-group">
                    <input v-model="input.transferRinkebyCoinAmount" type="number" class="form-control"  v-bind:max="$store.state.balance.token" />
                </div>
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </template>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onTransferRinkebyCoin()">Transfer {{ input.transferRinkebyCoinAmount }} THX</b-button>
            </template>
        </b-modal>

        <b-modal title="Transfer ETH" centered ref="modal-transfer-ether">

            <template v-if="!loading">
                <div class="form-group">
                    <input v-model="input.transferEtherAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000" />
                </div>
                <div class="form-group">
                    <input v-model="input.transferEtherAmount" type="number" class="form-control"  v-bind:max="$store.state.balance.token" />
                </div>
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </template>

            <template slot="modal-footer">
                <b-button size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onTransferEther()">Transfer {{ input.transferEtherAmount }} ETH</b-button>
            </template>
        </b-modal>

    </main>
</article>
</template>

<script src="./Account.ts" lang="ts"></script>
