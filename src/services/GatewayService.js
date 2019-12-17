import {
    Client,
    NonceTxMiddleware,
    SignedTxMiddleware,
    Address,
    LocalAddress,
    CryptoUtils,
    LoomProvider,
    Contracts,
    createEthereumGatewayAsync,
    soliditySha3
} from 'loom-js';
import Web3 from 'web3';
import config from '../config';

// TODO: fix this export in loom-js
const {
    OfflineWeb3Signer
} = require('loom-js/dist/solidity-helpers')
const BN = require('bn.js')
const {
    ethers
} = require('ethers')

const MyRinkebyCoinJSON = require('../contracts/THXTokenRinkeby.json')
const MyCoinJSON = require('../contracts/THXToken.json')

const TransferGateway = Contracts.TransferGateway
const AddressMapper = Contracts.AddressMapper

// See https://loomx.io/developers/en/testnet-plasma.html#ethereum-integration
// for the most up to date address.
const rinkebyGatewayAddress = '0x9c67fD4eAF0497f9820A3FBf782f81D6b6dC4Baa'
const extdevGatewayAddress = '0xE754d9518bF4a9C63476891eF9Aa7D91c8236a5d'
const extdevChainId = 'extdev-plasma-us1'
const INFURA_API_KEY = config.infura.key;

const coinMultiplier = new BN(10).pow(new BN(18))

export default class GatewayService {
    constructor(loomPrivateKey, rinkebyPrivateKey) {
        this.loomPrivateKeyString = loomPrivateKey;
        this.rinkebyPrivateKeyString = rinkebyPrivateKey;
    }

    // Returns a promise that will be resolved with the signed withdrawal receipt that contains the
    // data that must be submitted to the Ethereum Gateway to withdraw ERC20 tokens.
    async depositCoinToExtdevGateway({
        client,
        web3js,
        amount,
        ownerExtdevAddress,
        ownerRinkebyAddress,
        tokenExtdevAddress,
        tokenRinkebyAddress,
        timeout
    }) {
        const ownerExtdevAddr = Address.fromString(`${client.chainId}:${ownerExtdevAddress}`)
        const gatewayContract = await TransferGateway.createAsync(client, ownerExtdevAddr)

        const coinContract = await this.getExtdevCoinContract(web3js)
        try {
            await coinContract.methods
                .approve(extdevGatewayAddress.toLowerCase(), amount.toString())
                .send({
                    from: ownerExtdevAddress
                })
        } catch (err) {
            console.error('Withdraw failed while trying to approve token transfer to DAppChain Gateway.')
            throw err
        }

        const ownerRinkebyAddr = Address.fromString(`eth:${ownerRinkebyAddress}`)
        const receiveSignedWithdrawalEvent = new Promise((resolve, reject) => {
            let timer = setTimeout(
                () => reject(new Error('Timeout while waiting for withdrawal to be signed')),
                timeout
            )
            const listener = event => {
                const tokenEthAddr = Address.fromString(`eth:${tokenRinkebyAddress}`)
                if (
                    event.tokenContract.toString() === tokenEthAddr.toString() &&
                    event.tokenOwner.toString() === ownerRinkebyAddr.toString()
                ) {
                    clearTimeout(timer)
                    timer = null
                    gatewayContract.removeAllListeners(TransferGateway.EVENT_TOKEN_WITHDRAWAL)
                    resolve(event)
                }
            }
            gatewayContract.on(TransferGateway.EVENT_TOKEN_WITHDRAWAL, listener)
        })

        const tokenExtdevAddr = Address.fromString(`${client.chainId}:${tokenExtdevAddress}`)
        try {
            await gatewayContract.withdrawERC20Async(amount, tokenExtdevAddr, ownerRinkebyAddr)
            console.log(`${amount.div(coinMultiplier).toString()} tokens deposited to DAppChain Gateway...`)
        } catch (err) {
            console.error('Withdraw failed while trying to deposit tokens to DAppChain Gateway.')
            throw err
        }

        await receiveSignedWithdrawalEvent
        return gatewayContract.withdrawalReceiptAsync(ownerExtdevAddr)
    }

    async depositCoinToRinkebyGateway(web3js, amount, ownerAccount, gas) {
        const contract = await this.getRinkebyCoinContract(web3js)
        const contractAddress = await this.getRinkebyCoinContractAddress(web3js)
        const gateway = await this.getRinkebyGatewayContract(web3js, ownerAccount)

        let gasEstimate = await contract.methods
            .approve(rinkebyGatewayAddress, amount.toString())
            .estimateGas({
                from: ownerAccount.address
            })

        if (gasEstimate == gas) {
            throw new Error('Not enough enough gas, send more.')
        }

        await contract.methods
            .approve(rinkebyGatewayAddress, amount.toString())
            .send({
                from: ownerAccount.address,
                gas: gasEstimate
            })

        const tx = await gateway.depositERC20Async(amount, contractAddress, {
            gasLimit: gas
        })
        return tx.hash
    }

    async getRinkebyCoinBalance(web3js, accountAddress) {
        const contract = await this.getRinkebyCoinContract(web3js)
        const balance = await contract.methods
            .balanceOf(accountAddress)
            .call()
        return balance
    }

    async getExtdevCoinBalance(web3js, accountAddress) {
        const contract = await this.getExtdevCoinContract(web3js)
        const addr = accountAddress.toLowerCase()
        const balance = await contract.methods
            .balanceOf(addr)
            .call({
                from: addr
            })
        return balance
    }

    async getRinkebyCoinContract(web3js) {
        const networkId = await web3js.eth.net.getId()
        return new web3js.eth.Contract(
            MyRinkebyCoinJSON.abi,
            MyRinkebyCoinJSON.networks[networkId].address
        )
    }

    async getExtdevCoinContract(web3js) {
        const networkId = await web3js.eth.net.getId()
        return new web3js.eth.Contract(
            MyCoinJSON.abi,
            MyCoinJSON.networks[networkId].address,
        )
    }

    async getRinkebyCoinContractAddress(web3js) {
        const networkId = await web3js.eth.net.getId()
        return MyRinkebyCoinJSON.networks[networkId].address
    }

    async getRinkebyGatewayContract(web3js, web3Account) {
        const networkId = await web3js.eth.net.getId()

        let version
        switch (networkId) {
            case 1: // Ethereum Mainnet
                version = 1
                break

            case 4: // Rinkeby
                version = 2
                break

            default:
                throw new Error('Ethereum Gateway is not deployed on network ' + networkId)
        }

        return createEthereumGatewayAsync(
            version,
            rinkebyGatewayAddress,
            new ethers.Wallet(web3Account.privateKey, new ethers.providers.Web3Provider(web3js.currentProvider))
        )
    }

    async withdrawCoinFromRinkebyGateway({
        web3js,
        web3Account,
        receipt,
        gas
    }) {
        const gatewayContract = await this.getRinkebyGatewayContract(web3js, web3Account)
        const tx = await gatewayContract.withdrawAsync(receipt, {
            gasLimit: gas
        })
        return tx.hash
    }

    async getPendingWithdrawalReceipt(client, ownerAddress) {
        const ownerAddr = Address.fromString(`${client.chainId}:${ownerAddress}`)
        const gatewayContract = await TransferGateway.createAsync(client, ownerAddr)
        return gatewayContract.withdrawalReceiptAsync(ownerAddr)
    }

    loadRinkebyAccount() {
        const privateKey = this.rinkebyPrivateKeyString;
        const web3js = new Web3(`wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}`);
        const ownerAccount = web3js.eth.accounts.privateKeyToAccount(privateKey)
        web3js.eth.accounts.wallet.add(ownerAccount)
        return {
            account: ownerAccount,
            web3js
        }
    }

    loadExtdevAccount() {
        const privateKeyStr = this.loomPrivateKeyString;
        const privateKey = CryptoUtils.B64ToUint8Array(privateKeyStr)
        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
        const client = new Client(
            extdevChainId,
            'wss://extdev-plasma-us1.dappchains.com/websocket',
            'wss://extdev-plasma-us1.dappchains.com/queryws'
        )
        client.txMiddleware = [
            new NonceTxMiddleware(publicKey, client),
            new SignedTxMiddleware(privateKey)
        ]
        client.on('error', msg => {
            console.error('PlasmaChain connection error', msg)
        })

        return {
            account: LocalAddress.fromPublicKey(publicKey).toString(),
            web3js: new Web3(new LoomProvider(client, privateKey)),
            client
        }
    }

    async mapContracts({
        client,
        signer,
        tokenRinkebyAddress,
        tokenExtdevAddress,
        ownerExtdevAddress,
        rinkebyTxHash
    }) {
        const ownerExtdevAddr = Address.fromString(`${client.chainId}:${ownerExtdevAddress}`)
        const gatewayContract = await TransferGateway.createAsync(client, ownerExtdevAddr)
        const foreignContract = Address.fromString(`eth:${tokenRinkebyAddress}`)
        const localContract = Address.fromString(`${client.chainId}:${tokenExtdevAddress}`)

        const hash = soliditySha3({
            type: 'address',
            value: tokenRinkebyAddress.slice(2)
        }, {
            type: 'address',
            value: tokenExtdevAddress.slice(2)
        })

        const foreignContractCreatorSig = await signer.signAsync(hash)
        const foreignContractCreatorTxHash = Buffer.from(rinkebyTxHash.slice(2), 'hex')

        await gatewayContract.addContractMappingAsync({
            localContract,
            foreignContract,
            foreignContractCreatorSig,
            foreignContractCreatorTxHash
        })
    }

    async _mapAccounts({
        client,
        signer,
        ownerRinkebyAddress,
        ownerExtdevAddress
    }) {
        const ownerRinkebyAddr = Address.fromString(`eth:${ownerRinkebyAddress}`)
        const ownerExtdevAddr = Address.fromString(`${client.chainId}:${ownerExtdevAddress}`)
        const mapperContract = await AddressMapper.createAsync(client, ownerExtdevAddr)

        try {
            const mapping = await mapperContract.getMappingAsync(ownerExtdevAddr)
            console.log(`${mapping.from.toString()} is already mapped to ${mapping.to.toString()}`)
            return
        } catch (err) {
            // assume this means there is no mapping yet, need to fix loom-js not to throw in this case
        }
        console.log(`mapping ${ownerRinkebyAddr.toString()} to ${ownerExtdevAddr.toString()}`)
        await mapperContract.addIdentityMappingAsync(ownerExtdevAddr, ownerRinkebyAddr, signer)
        console.log(`Mapped ${ownerExtdevAddr} to ${ownerRinkebyAddr}`)
    }

    async mapAccounts(
        rinkebyPrivateKeyString = null,
        loomPrivateKeyString = null
    ) {
        if (rinkebyPrivateKeyString != null && loomPrivateKeyString != null) {
            this.rinkebyPrivateKeyString = rinkebyPrivateKeyString;
            this.loomPrivateKeyString = loomPrivateKeyString;
        }

        let client
        try {
            const rinkeby = this.loadRinkebyAccount()
            const extdev = this.loadExtdevAccount()
            client = extdev.client

            const signer = new OfflineWeb3Signer(rinkeby.web3js, rinkeby.account)
            await this._mapAccounts({
                client,
                signer,
                ownerRinkebyAddress: rinkeby.account.address,
                ownerExtdevAddress: extdev.account
            })
        } catch (err) {
            console.error(err)
        }
    }

    async depositCoin(amount) {
        const {
            account,
            web3js
        } = this.loadRinkebyAccount()
        try {
            const actualAmount = new BN(amount).mul(coinMultiplier)
            const txHash = await this.depositCoinToRinkebyGateway(
                web3js, actualAmount, account, 350000
            )
            console.log(`${amount} tokens deposited to Ethereum Gateway.`)
            console.log(`Rinkeby tx hash: ${txHash}`)
        } catch (err) {
            console.error(err)
        }
    }

    async withdrawCoin(amount) {
        try {
            const extdev = this.loadExtdevAccount()
            const rinkeby = this.loadRinkebyAccount()
            const actualAmount = new BN(amount).mul(coinMultiplier)
            const rinkebyNetworkId = await rinkeby.web3js.eth.net.getId()
            const extdevNetworkId = await extdev.web3js.eth.net.getId()
            const receipt = await this.depositCoinToExtdevGateway({
                client: extdev.client,
                web3js: extdev.web3js,
                amount: actualAmount,
                ownerExtdevAddress: extdev.account,
                ownerRinkebyAddress: rinkeby.account.address,
                tokenExtdevAddress: MyCoinJSON.networks[extdevNetworkId].address,
                tokenRinkebyAddress: MyRinkebyCoinJSON.networks[rinkebyNetworkId].address,
                timeout: 120000
            })
            const txHash = await this.withdrawCoinFromRinkebyGateway({
                web3js: rinkeby.web3js,
                web3Account: rinkeby.account,
                receipt,
                gas: 350000
            })
            console.log(`${amount} tokens withdrawn from Ethereum Gateway.`)
            console.log(`Rinkeby tx hash: ${txHash}`)
        } catch (err) {
            console.error(err)
        }
    }

    async resumeWithdrawal() {
        try {
            const extdev = this.loadExtdevAccount()
            const rinkeby = this.loadRinkebyAccount()

            const networkId = await rinkeby.web3js.eth.net.getId()
            const myRinkebyCoinAddress = Address.fromString(`eth:${MyRinkebyCoinJSON.networks[networkId].address}`)
            const receipt = await this.getPendingWithdrawalReceipt(extdev.client, extdev.account)

            console.log(receipt.tokenContract.toString() === myRinkebyCoinAddress.toString())

            if (receipt.tokenContract.toString() === myRinkebyCoinAddress.toString()) {
                console.log(`Found pending withdrawal of ${receipt.tokenAmount.div(coinMultiplier).toString()} coins.`)
                const txHash = await this.withdrawCoinFromRinkebyGateway({
                    web3js: rinkeby.web3js,
                    web3Account: rinkeby.account,
                    receipt,
                    gas: 350000
                })
                console.log(`${receipt.tokenAmount.div(coinMultiplier).toString()} tokens withdrawn from Etheruem Gateway.`)
                console.log(`Rinkeby tx hash: ${txHash}`)
            } else {
                console.log("Unsupported asset type!")
            }
        } catch (err) {
            console.error(err)
        }
    }
}