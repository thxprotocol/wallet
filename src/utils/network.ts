import Web3 from 'web3';
import Matic from '@maticnetwork/maticjs';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { CHILD_RPC, INFURA_KEY, ROOT_RPC } from './secrets';
import { ethers, Signer } from 'ethers';

export const config = {
    root: {
        RPC: `${ROOT_RPC}/${INFURA_KEY}`,
        POSRootChainManager: '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74',
        RootChainProxyAddress: '0x2890bA17EfE978480615e330ecB65333b880928e',
        DERC20: '0x655F2166b0709cd575202630952D71E2bB0d61Af',
        posERC20Predicate: '0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34',
        posEtherPredicate: '0xe2B01f3978c03D6DdA5aE36b2f3Ac0d66C54a6D5',
    },
    child: {
        RPC: CHILD_RPC,
        DERC20: '0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1',
        MaticWETH: '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323',
    },
};

const solutionContract = (address: string, signer: Signer) =>
    new ethers.Contract(address, ISolutionArtifact.abi, signer);

// export const maticPOSClient = new Matic.MaticPOSClient({
//     network: 'testnet',
//     version: 'mumbai',
//     parentProvider: new HDWalletProvider(account.privateKey, `${ROOT_RPC}/${INFURA_KEY}`),
//     maticProvider: new HDWalletProvider(account.privateKey, CHILD_RPC),
//     posRootChainManager: config.root.POSRootChainManager,
//     posERC20Predicate: config.root.posERC20Predicate,
//     parentDefaultOptions: { from: account.address },
//     maticDefaultOptions: { from: account.address },
// });
// export const maticWeb3 = maticPOSClient.web3Client.getMaticWeb3();
// export async function checkInclusion(txHash: string) {
//     const web3 = new Web3(`${ROOT_RPC}/${INFURA_KEY}`);
//     const childWeb3 = maticPOSClient.web3Client.getMaticWeb3();
//     const txDetails = await childWeb3.eth.getTransactionReceipt(txHash);
//     const block = txDetails.blockNumber;

//     return new Promise((resolve, reject) => {
//         web3.eth.subscribe(
//             'logs',
//             {
//                 address: config.root.RootChainProxyAddress,
//             },
//             async (error, result) => {
//                 if (error) {
//                     reject(error);
//                 }

//                 if (result.data) {
//                     const transaction = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'bytes32'], result.data);
//                     if (block <= transaction['1']) {
//                         resolve(result);
//                     }
//                 }
//             },
//         );
//     });
// }
