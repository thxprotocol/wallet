import Web3 from 'web3';
import Matic from '@maticnetwork/maticjs';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { ethers } from 'ethers';
import { WITHDRAW_POLL_ABI } from './contracts';
import { CHILD_RPC, GAS_STATION_ADDRESS, INFURA_KEY, MATIC_ADDRESS, ROOT_RPC } from './secrets';

import * as GAS_STATION from '../artifacts/GasStation.json';

export interface QR {
    assetPoolAddress: string;
    contractAddress: string;
    method: string;
    params: {
        agree: boolean;
    };
}

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
        MATIC: MATIC_ADDRESS,
        MaticWETH: '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323',
    },
};

const wallet = ethers.Wallet.createRandom();
const provider = new ethers.providers.JsonRpcProvider(CHILD_RPC);

export const PRIVATE_KEY = wallet.privateKey;
export const account = new ethers.Wallet(localStorage.getItem('thx:wallet:privatekey') || PRIVATE_KEY, provider);
export const gasStation = new ethers.Contract(GAS_STATION_ADDRESS, GAS_STATION.abi, provider.getSigner());
export function basePollContract(address: string) {
    return new ethers.Contract(address, WITHDRAW_POLL_ABI, account);
}
export const maticPOSClient = new Matic.MaticPOSClient({
    network: 'testnet',
    version: 'mumbai',
    parentProvider: new HDWalletProvider(PRIVATE_KEY, config.root.RPC),
    maticProvider: new HDWalletProvider(PRIVATE_KEY, config.child.RPC),
    posRootChainManager: config.root.POSRootChainManager,
    posERC20Predicate: config.root.posERC20Predicate,
    parentDefaultOptions: { from: account.address },
    maticDefaultOptions: { from: account.address },
});
export async function checkInclusion(txHash: string) {
    const web3 = new Web3(config.root.RPC);
    const childWeb3 = new Web3(config.child.RPC);
    const txDetails = await childWeb3.eth.getTransactionReceipt(txHash);

    return new Promise((resolve, reject) => {
        web3.eth.subscribe(
            'logs',
            {
                address: config.root.RootChainProxyAddress,
            },
            async (error, result: any) => {
                if (error) {
                    reject(error);
                }
                console.log(result);

                if (result.data) {
                    const transaction: any = web3.eth.abi.decodeParameters(
                        ['uint256', 'uint256', 'bytes32'],
                        result.data,
                    );
                    console.log(transaction);

                    if (txDetails.blockNumber <= transaction['1']) {
                        resolve(result);
                    }
                }
            },
        );
    });
}
