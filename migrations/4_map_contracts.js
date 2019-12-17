import THXToken from '../contracts/THXToken.json';
import THXTokenRinkeby from '../contracts/THXTokenRinkeby.json';
import Web3 from 'web3';

const TransferGateway = Contracts.TransferGateway;
const { OfflineWeb3Signer } = require('loom-js/dist/solidity-helpers')

import { Client,
    LocalAddress,
    CryptoUtils,
    LoomProvider,
    Address,
    Contracts
} from 'loom-js';


module.exports = function(deployer, network, accounts) {
    if (network !== 'rinkeby kill') {
        return
    }

    const rinkeby = loadRinkebyAccount()
    const extdev = loadExtdevAccount()
    client = extdev.client

    const rinkebyNetworkId = await rinkeby.web3js.eth.net.getId()
    const extdevNetworkId = await extdev.web3js.eth.net.getId()

    let tokenRinkebyAddress, tokenExtdevAddress, rinkebyTxHash

    tokenRinkebyAddress = THXTokenRinkeby.networks[rinkebyNetworkId].address
    rinkebyTxHash = THXTokenRinkeby.networks[rinkebyNetworkId].transactionHash
    tokenExtdevAddress = THXToken.networks[extdevNetworkId].address

    const signer = new OfflineWeb3Signer(rinkeby.web3js, rinkeby.account)
    await mapContracts({
        client,
        signer,
        tokenRinkebyAddress,
        tokenExtdevAddress,
        ownerExtdevAddress: extdev.account,
        rinkebyTxHash
    })

    console.log('\n*************************************************************************\n')
    console.log(`Submitted request to map ${tokenExtdevAddress} to ${tokenRinkebyAddress}`)
    console.log('\n*************************************************************************\n')
}

async function mapContracts({
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