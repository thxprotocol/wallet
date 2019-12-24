<template>
<article class="region region-container">
    <main class="region region-content">

        <h2>{{$account.profile.firstName}} {{$account.profile.lastName}}</h2>

        <BAlert v-if="alert" show :variant="alert.variant ? alert.variant : 'info'">
          {{ alert.text }}
        </BAlert>

        <div class="card mb-3">
            <div class="card-body">
                <span v-if="!$account.profile.picture" class="float-left mr-3">
                    <label class="text-center">
                        <ProfilePicture size="lg" :profile="$account.profile" /><br>
                        <span class="btn btn-link">Upload image</span>
                        <input type="file" @change="onFileChange" class="d-none">
                    </label>
                </span>
                <span v-if="$account.profile.picture" class="float-left mr-3 text-center">
                    <ProfilePicture size="lg" :profile="$account.profile" /><br>
                    <button class="btn btn-link" @click="removeImage">Delete</button>
                </span>

                <h3>E-mail:</h3>
                <p>{{$account.profile.email}}</p>

                <h3>UID:</h3>
                <p>{{$account.uid}}</p>
                <hr class="mt-5">
                <button class="btn btn-link btn-block" @click="showModal('modal-connect')">Connect Accounts</button>
            </div>
        </div>

        <div class="card mb-3" v-if="$network.rinkeby && $network.rinkeby.account">
            <div class="card-header">
                <strong>Rinkeby Network</strong><br>
                <small>{{$network.rinkeby.account.address}} <a class="text-primary" @click="copyClipboard($network.rinkeby.account.address)">({{clipboard === $network.rinkeby.account.address ? 'Copied!' : 'Copy'}})</a></small>
            </div>
            <div class="card-body">
                <ul class="list-bullets">
                    <li><button class="btn btn-link" @click="showModal('modal-gateway-deposit')">Deposit THX to Gateway</button></li>
                    <li><button class="btn btn-link" @click="showModal('modal-gateway-withdraw')">Withdraw THX from Gateway</button></li>
                    <li v-if="isRinkebyMinter"><button class="btn btn-link" @click="showModal('modal-add-minter')">Add minter role</button></li>
                    <li v-if="isRinkebyMinter"><button class="btn btn-link" @click="showModal('modal-mint-rinkeby')">Mint tokens</button></li>
                </ul>
            </div>
        </div>

        <div class="card mb-3" v-if="$network.extdev && $network.extdev.account">
            <div class="card-header">
                <strong>Loom Network</strong><br>
                <small>{{$network.extdev.account}}
                    <a class="text-primary" @click="copyClipboard($network.extdev.account)">
                        ({{clipboard === $network.extdev.account ? 'Copied!' : 'Copy'}})
                    </a>
                </small>
            </div>
            <div class="card-body">
                <ul class="list-bullets">
                    <li v-if="isExtdevMinter"><button class="btn btn-link" @click="showModal('modal-mint-extdev')">Mint Loom tokens</button></li>
                    <li><button class="btn btn-link" @click="showModal('modal-transfer')">Transfer tokens</button></li>
                </ul>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <button @click="reset()" class="btn btn-link mr-2">Reset</button>
            <button @click="logout()" class="btn btn-primary">Logout</button>
        </div>

        <BModal title="Connect accounts" centered ref="modal-connect">
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
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onCreateAccountsFromPrivateKey()">Connect</BButton>
            </template>
        </BModal>

        <BModal title="Add minter role" centered ref="modal-add-minter">
            <p>Provide an account with the minting role so it can generate THX on the sidechain.</p>

            <template v-if="!loading">
                <p>Lorem ipsum dolor sit amet.</p>
                <input v-model="input.newMinterAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template slot="modal-footer">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onAddMinter()">Connect Accounts</BButton>
            </template>
        </BModal>

        <BModal title="Mint tokens for Rinkeby account" centered ref="modal-mint-rinkeby">

            <template v-if="!loading" >
                <input v-model="input.mintForAccount" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template slot="modal-footer">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onMintRinkebyCoin()">Mint {{ input.mintForAccount }} THX </BButton>
            </template>
        </BModal>

        <BModal title="Mint tokens for Loom account" centered ref="modal-mint-extdev">

            <template v-if="!loading">
                <input v-model="input.mintForLoomAccount" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template slot="modal-footer">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onMintExtdevCoin()">Mint {{ input.mintForLoomAccount }} THX </BButton>
            </template>

        </BModal>

        <BModal title="Deposit THX to Transfer Gateway" centered ref="modal-gateway-deposit">
            <p>Use the transfer gateway to move your THX from the sidechain on to the main ethereum chain.</p>
            <template v-if="!loading">
                <input v-model="input.depositToGateway" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template slot="modal-footer">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onDepositToGateway()">Deposit {{ input.depositToGateway }} THX </BButton>
            </template>
        </BModal>

        <BModal title="Withdraw THX to Transfer Gateway" centered ref="modal-gateway-withdraw">
            <p>Use the transfer gateway to move your THX from the sidechain on to the main ethereum chain.</p>
            <template v-if="!loading">
                <input v-model="input.withdrawToGateway" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template slot="modal-footer">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onWithdrawToGateway()">Withdraw {{ input.withdrawToGateway }} THX </BButton>
            </template>
        </BModal>

        <BModal title="Transfer tokens on sidechain" centered ref="modal-transfer">
            <p>Transfer an amount of THX to another wallet on the sidechain. To send it to a wallet on the main network, use the transfer gateway.</p>

            <template v-if="!loading">
                <div class="form-group">
                    <input v-model="input.transferTokensAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000" />
                </div>
                <div class="form-group">
                    <input v-model="input.transferTokens" type="number" class="form-control"  v-bind:max="$parent.$refs.header.balance.token" />
                </div>
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template slot="modal-footer">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onTransferTokens()">Transfer {{ input.transferTokens }} THX</BButton>
            </template>
        </BModal>

    </main>
</article>
</template>

<script src="./Account.ts" lang="ts"></script>