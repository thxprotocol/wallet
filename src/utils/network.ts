import Matic from '@maticnetwork/maticjs';
import HDWalletProvider from '@truffle/hdwallet-provider';
import Web3 from 'web3';
import { WITHDRAW_POLL_ABI } from './contracts';
import { INFURA_KEY, MATIC_ADDRESS, PRIVATE_KEY } from './secrets';

export interface QR {
    contractAddress: string;
    contract: string;
    method: string;
    params: {
        agree: boolean;
    };
}

export const config = {
    root: {
        RPC: 'wss://goerli.infura.io/ws/v3/' + INFURA_KEY,
        POSRootChainManager: '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74',
        RootChainProxyAddress: '0x2890bA17EfE978480615e330ecB65333b880928e',
        DERC20: '0x655F2166b0709cd575202630952D71E2bB0d61Af',
        posERC20Predicate: '0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34',
        posEtherPredicate: '0xe2B01f3978c03D6DdA5aE36b2f3Ac0d66C54a6D5',
    },
    child: {
        RPC: 'https://rpc-mumbai.matic.today',
        DERC20: '0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1',
        MATIC: MATIC_ADDRESS || '',
        MaticWETH: '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323',
    },
};
const web3 = new Web3(config.child.RPC);

export function withdrawPollContract(address: string) {
    return new web3.eth.Contract(WITHDRAW_POLL_ABI as any, address);
}

export const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
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
            async (error, result) => {
                if (error) {
                    reject(error);
                }
                console.log(result);

                if (result.data) {
                    const transaction = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'bytes32'], result.data);
                    console.log(transaction);

                    if (txDetails.blockNumber <= transaction['1']) {
                        resolve(result);
                    }
                }
            },
        );
    });
}
