import { Vue } from 'vue-property-decorator';
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
    soliditySha3,
} from 'loom-js';
import Web3 from 'web3';
const Config = require('../config');
const { OfflineWeb3Signer } = require('loom-js/dist/solidity-helpers');
const { ethers } = require('ethers');
const BN = require('bn.js');
const MyRinkebyCoinJSON = require('../contracts/THXTokenRinkeby.json');
const MyCoinJSON = require('../contracts/THXToken.json');
const TransferGateway = Contracts.TransferGateway;
const AddressMapper = Contracts.AddressMapper;

// See https://loomx.io/developers/en/testnet-plasma.html#ethereum-integration
// for the most up to date address.
const rinkebyGatewayAddress = '0x9c67fD4eAF0497f9820A3FBf782f81D6b6dC4Baa';
const extdevGatewayAddress = '0xE754d9518bF4a9C63476891eF9Aa7D91c8236a5d';
const extdevChainId = 'extdev-plasma-us1';
const INFURA_API_KEY = Config.infura.key;

const coinMultiplier = new BN(10).pow(new BN(18));

export class Network extends Vue {
    public loomPrivateKeyString: string;
    public rinkebyPrivateKeyString: string;
    public extdev: any;
    public rinkeby: any;
    public web3js: any = new Web3();

    constructor(
        extdevPrivateKey: string,
        rinkebyPrivateKey: string,
    ) {
        super();

        this.loomPrivateKeyString = extdevPrivateKey;
        this.rinkebyPrivateKeyString = rinkebyPrivateKey;

        if (extdevPrivateKey && rinkebyPrivateKey) {
            this.extdev = this.loadExtdevAccount();
            this.rinkeby = this.loadRinkebyAccount();

            this.resumeWithdrawal();
        }
    }

    // Returns a promise that will be resolved with the signed withdrawal receipt that contains the
    // data that must be submitted to the Ethereum Gateway to withdraw ERC20 tokens.
    public async depositCoinToExtdevGateway({
        client,
        web3js,
        amount,
        ownerExtdevAddress,
        ownerRinkebyAddress,
        tokenExtdevAddress,
        tokenRinkebyAddress,
        timeout,
    }: any) {
        const ownerExtdevAddr = Address.fromString(`${client.chainId}:${ownerExtdevAddress}`);
        const gatewayContract = await TransferGateway.createAsync(client, ownerExtdevAddr);

        const coinContract = await this.getExtdevCoinContract(web3js);
        try {
            await coinContract.methods
                .approve(extdevGatewayAddress.toLowerCase(), amount.toString())
                .send({
                    from: ownerExtdevAddress,
                });
        } catch (err) {
            console.error('Withdraw failed while trying to approve token transfer to DAppChain Gateway.');
            throw err;
        }

        const ownerRinkebyAddr = Address.fromString(`eth:${ownerRinkebyAddress}`);
        const receiveSignedWithdrawalEvent = new Promise((resolve, reject) => {
            let timer: any = setTimeout(
                () => reject(new Error('Timeout while waiting for withdrawal to be signed')),
                timeout,
            );
            const listener = (event: any) => {
                const tokenEthAddr = Address.fromString(`eth:${tokenRinkebyAddress}`);
                if (
                    event.tokenContract.toString() === tokenEthAddr.toString() &&
                    event.tokenOwner.toString() === ownerRinkebyAddr.toString()
                ) {
                    clearTimeout(timer);
                    timer = null;
                    gatewayContract.removeAllListeners(TransferGateway.EVENT_TOKEN_WITHDRAWAL);
                    resolve(event);
                }
            };
            gatewayContract.on(TransferGateway.EVENT_TOKEN_WITHDRAWAL, listener);
        });

        const tokenExtdevAddr = Address.fromString(`${client.chainId}:${tokenExtdevAddress}`);
        try {
            await gatewayContract.withdrawERC20Async(amount, tokenExtdevAddr, ownerRinkebyAddr);
            console.log(`${amount.div(coinMultiplier).toString()} tokens deposited to DAppChain Gateway...`);
        } catch (err) {
            console.error('Withdraw failed while trying to deposit tokens to DAppChain Gateway.');
            throw err;
        }

        await receiveSignedWithdrawalEvent;
        return gatewayContract.withdrawalReceiptAsync(ownerExtdevAddr);
    }

    public async depositCoinToRinkebyGateway(web3js: string, amount: number, ownerAccount: any, gas: number) {
        const contract = await this.getRinkebyCoinContract(web3js);
        const contractAddress = await this.getRinkebyCoinContractAddress(web3js);
        const gateway = await this.getRinkebyGatewayContract(web3js, ownerAccount);

        const gasEstimate = await contract.methods
            .approve(rinkebyGatewayAddress, amount.toString())
            .estimateGas({
                from: ownerAccount.address,
            });

        if (gasEstimate == gas) {
            throw new Error('Not enough enough gas, send more.');
        }

        await contract.methods
            .approve(rinkebyGatewayAddress, amount.toString())
            .send({
                from: ownerAccount.address,
                gas: gasEstimate,
            });

        const tx = await gateway.depositERC20Async(amount, contractAddress, {
            gasLimit: gas,
        });
        return tx.hash;
    }

    public async getRinkebyCoinContract(web3js: any) {
        const networkId = await web3js.eth.net.getId();
        return new web3js.eth.Contract(
            MyRinkebyCoinJSON.abi,
            MyRinkebyCoinJSON.networks[networkId].address,
        );
    }

    public async getExtdevCoinContract(web3js: any) {
        const networkId = await web3js.eth.net.getId();
        return new web3js.eth.Contract(
            MyCoinJSON.abi,
            MyCoinJSON.networks[networkId].address,
        );
    }

    public async getExtdevContract(web3js: any, contractAbi: any, contractAddr: string) {
        const networkId = await web3js.eth.net.getId();
        return new web3js.eth.Contract(
            contractAbi,
            contractAddr,
        );
    }

    public async getRinkebyCoinContractAddress(web3js: any) {
        const networkId = await web3js.eth.net.getId();
        return MyRinkebyCoinJSON.networks[networkId].address;
    }

    public async getRinkebyGatewayContract(web3js: any, web3Account: any) {
        const networkId = await web3js.eth.net.getId();

        let version: any;
        switch (networkId) {
            case 1: // Ethereum Mainnet
                version = 1;
                break;

            case 4: // Rinkeby
                version = 2;
                break;

            default:
                throw new Error('Ethereum Gateway is not deployed on network ' + networkId);
        }

        return createEthereumGatewayAsync(
            version,
            rinkebyGatewayAddress,
            new ethers.Wallet(web3Account.privateKey, new ethers.providers.Web3Provider(web3js.currentProvider)),
        );
    }

    public async withdrawCoinFromRinkebyGateway({
        web3js,
        web3Account,
        receipt,
        gas,
    }: any) {
        const gatewayContract = await this.getRinkebyGatewayContract(web3js, web3Account);
        const tx = await gatewayContract.withdrawAsync(receipt, {
            gasLimit: gas,
        });
        return tx.hash;
    }

    public async getPendingWithdrawalReceipt(client: any, ownerAddress: string) {
        const ownerAddr = Address.fromString(`${client.chainId}:${ownerAddress}`);
        const gatewayContract = await TransferGateway.createAsync(client, ownerAddr);
        return gatewayContract.withdrawalReceiptAsync(ownerAddr);
    }

    public loadRinkebyAccount() {
        const privateKey = this.rinkebyPrivateKeyString;
        const web3js = new Web3(`wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}`);
        const ownerAccount = web3js.eth.accounts.privateKeyToAccount(privateKey);
        web3js.eth.accounts.wallet.add(ownerAccount);
        return {
            account: ownerAccount,
            web3js,
        };
    }

    public loadExtdevAccount() {
        const privateKeyStr = this.loomPrivateKeyString;
        const privateKey = CryptoUtils.B64ToUint8Array(privateKeyStr);
        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);
        const client = new Client(
            extdevChainId,
            'wss://extdev-plasma-us1.dappchains.com/websocket',
            'wss://extdev-plasma-us1.dappchains.com/queryws',
        );
        client.txMiddleware = [
            new NonceTxMiddleware(publicKey, client),
            new SignedTxMiddleware(privateKey),
        ];
        client.on('error', (msg) => {
            console.error('PlasmaChain connection error', msg);
        });

        return {
            account: LocalAddress.fromPublicKey(publicKey).toString(),
            web3js: new Web3(new LoomProvider(client, privateKey)),
            client,
        };
    }

    public async mapContracts({
        client,
        signer,
        tokenRinkebyAddress,
        tokenExtdevAddress,
        ownerExtdevAddress,
        rinkebyTxHash,
    }: any) {
        const ownerExtdevAddr = Address.fromString(`${client.chainId}:${ownerExtdevAddress}`);
        const gatewayContract = await TransferGateway.createAsync(client, ownerExtdevAddr);
        const foreignContract = Address.fromString(`eth:${tokenRinkebyAddress}`);
        const localContract = Address.fromString(`${client.chainId}:${tokenExtdevAddress}`);

        const hash = soliditySha3({
            type: 'address',
            value: tokenRinkebyAddress.slice(2),
        }, {
            type: 'address',
            value: tokenExtdevAddress.slice(2),
        });

        const foreignContractCreatorSig = await signer.signAsync(hash);
        const foreignContractCreatorTxHash = Buffer.from(rinkebyTxHash.slice(2), 'hex');

        await gatewayContract.addContractMappingAsync({
            localContract,
            foreignContract,
            foreignContractCreatorSig,
            foreignContractCreatorTxHash,
        });
    }

    public async _mapAccounts({
        client,
        signer,
        ownerRinkebyAddress,
        ownerExtdevAddress,
    }: any) {
        const ownerRinkebyAddr = Address.fromString(`eth:${ownerRinkebyAddress}`);
        const ownerExtdevAddr = Address.fromString(`${client.chainId}:${ownerExtdevAddress}`);
        const mapperContract = await AddressMapper.createAsync(client, ownerExtdevAddr);

        try {
            const mapping = await mapperContract.getMappingAsync(ownerExtdevAddr);
            console.log(`${mapping.from.toString()} is already mapped to ${mapping.to.toString()}`);
            return;
        } catch (err) {
            // assume this means there is no mapping yet, need to fix loom-js not to throw in this case
        }
        console.log(`mapping ${ownerRinkebyAddr.toString()} to ${ownerExtdevAddr.toString()}`);
        await mapperContract.addIdentityMappingAsync(ownerExtdevAddr, ownerRinkebyAddr, signer);
        console.log(`Mapped ${ownerExtdevAddr} to ${ownerRinkebyAddr}`);
    }

    public async mapAccounts(
        rinkebyPrivateKeyString: string | null = null,
        loomPrivateKeyString: string | null = null,
    ) {
        if (rinkebyPrivateKeyString != null && loomPrivateKeyString != null) {
            this.rinkebyPrivateKeyString = rinkebyPrivateKeyString;
            this.loomPrivateKeyString = loomPrivateKeyString;
        }

        let client;
        try {
            const rinkeby = this.loadRinkebyAccount();
            const extdev = this.loadExtdevAccount();
            client = extdev.client;

            const signer = new OfflineWeb3Signer(rinkeby.web3js, rinkeby.account);
            await this._mapAccounts({
                client,
                signer,
                ownerRinkebyAddress: rinkeby.account.address,
                ownerExtdevAddress: extdev.account,
            });
        } catch (err) {
            console.error(err);
        }
    }

    public async depositCoin(amount: string) {
        const {
            account,
            web3js,
        } = this.loadRinkebyAccount();
        try {
            const actualAmount = new BN(amount).mul(coinMultiplier);
            const txHash = await this.depositCoinToRinkebyGateway(
                web3js, actualAmount, account, 350000,
            );
            console.log(`${amount} tokens deposited to Ethereum Gateway.`);
            console.log(`Rinkeby tx hash: ${txHash}`);
        } catch (err) {
            console.error(err);
        }
    }

    public async getRinkebyCoinBalance(web3js: any, accountAddress: string) {
        const contract = await this.getRinkebyCoinContract(web3js);
        const balance = await contract.methods
            .balanceOf(accountAddress)
            .call();
        return balance;
    }

    public async getExtdevCoinBalance(web3js: any, accountAddress: string) {
        const contract = await this.getExtdevCoinContract(web3js);
        const addr = accountAddress.toLowerCase();
        const balance = await contract.methods
            .balanceOf(addr)
            .call({
                from: addr,
            });
        return balance;
    }

    public async isExtdevMinter(web3js: any, accountAddress: string) {
        const contract = await this.getExtdevCoinContract(web3js);
        const addr = accountAddress.toLowerCase();
        const isMinter = await contract.methods
            .isMinter(addr)
            .call({
                from: addr,
            });
        return isMinter;
    }

    public async isRinkebyMinter(web3js: any, accountAddress: string) {
        const contract = await this.getRinkebyCoinContract(web3js);
        const isMinter = await contract.methods
            .isMinter(accountAddress)
            .call();
        return isMinter;
    }

    public async transferCoin(receiver: string, amount: number) {
        const contract = await this.getExtdevCoinContract(this.extdev.web3js);
        const approvedTx = await contract.methods
            .approve(receiver, amount.toString())
            .send({
                from: this.extdev.account,
            });
        const sendTx = await contract.methods
            .transfer(receiver, amount.toString())
            .send({
                from: this.extdev.account
            });
        console.log(sendTx)
    }

    public async mintRinkebyCoin(receiver: string, amount: number) {

    }

    public async mintExtdevCoin(receiver: string, amount: number) {

    }

    public async addRinkebyMinter(address: string) {

    }

    public async addExtdevMinter(address: string) {

    }

    public async withdrawCoin(amount: string) {
        try {
            const extdev = this.loadExtdevAccount();
            const rinkeby = this.loadRinkebyAccount();
            const actualAmount = new BN(amount).mul(coinMultiplier);
            const rinkebyNetworkId = await rinkeby.web3js.eth.net.getId();
            const extdevNetworkId = await extdev.web3js.eth.net.getId();
            const receipt = await this.depositCoinToExtdevGateway({
                client: extdev.client,
                web3js: extdev.web3js,
                amount: actualAmount,
                ownerExtdevAddress: extdev.account,
                ownerRinkebyAddress: rinkeby.account.address,
                tokenExtdevAddress: MyCoinJSON.networks[extdevNetworkId].address,
                tokenRinkebyAddress: MyRinkebyCoinJSON.networks[rinkebyNetworkId].address,
                timeout: 120000,
            });
            const txHash = await this.withdrawCoinFromRinkebyGateway({
                web3js: rinkeby.web3js,
                web3Account: rinkeby.account,
                receipt,
                gas: 350000,
            });
            console.log(`${amount} tokens withdrawn from Ethereum Gateway.`);
            console.log(`Rinkeby tx hash: ${txHash}`);
        } catch (err) {
            console.error(err);
        }
    }

    public async resumeWithdrawal() {
        try {
            const extdev = this.loadExtdevAccount();
            const rinkeby = this.loadRinkebyAccount();

            const networkId = await rinkeby.web3js.eth.net.getId();
            const myRinkebyCoinAddress = Address.fromString(`eth:${MyRinkebyCoinJSON.networks[networkId].address}`);
            const receipt: any = await this.getPendingWithdrawalReceipt(extdev.client, extdev.account);

            if (receipt && receipt.tokenContract.toString() === myRinkebyCoinAddress.toString()) {
                console.log(`Found pending withdrawal of ${receipt.tokenAmount.div(coinMultiplier).toString()} coins.`);
                const txHash = await this.withdrawCoinFromRinkebyGateway({
                    web3js: rinkeby.web3js,
                    web3Account: rinkeby.account,
                    receipt,
                    gas: 350000,
                });
                console.log(`${receipt.tokenAmount.div(coinMultiplier).toString()} tokens withdrawn from Etheruem Gateway.`);
                console.log(`Rinkeby tx hash: ${txHash}`);
            } else {
                console.log('No pending withdrawels found!');
            }
        } catch (err) {
            console.error(err);
        }
    }
}