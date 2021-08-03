import Web3 from 'web3';
import { fromWei, isAddress } from 'web3-utils';
import Artifacts from '@/utils/artifacts';
import Contract from 'web3/eth/contract';
import { soliditySha3 } from 'web3-utils';
import { Account } from 'web3/eth/accounts';

export const MINIMUM_GAS_LIMIT = 54680;

export enum NetworkProvider {
    Test = 0,
    Main = 1,
}

export async function signCall(web3: Web3, poolAddress: string, name: string, params: any[], account: Account) {
    try {
        const solution = new web3.eth.Contract(Artifacts.IDefaultDiamond.abi as any, poolAddress, {
            from: account.address,
        });
        const abi: any = Artifacts.IDefaultDiamond.abi.find(fn => fn.name === name);
        const nonce = Number(await solution.methods.getLatestNonce(account.address).call()) + 1;
        const call = web3.eth.abi.encodeFunctionCall(abi, params);
        const hash = soliditySha3(call, nonce) || '';
        const sig = web3.eth.accounts.sign(hash, account.privateKey).signature;

        return {
            call,
            nonce,
            sig,
        };
    } catch (e) {
        return {
            error: 'Could not sign the call',
        };
    }
}

export async function send(web3: Web3, contract: Contract, fn: any, privateKey: string) {
    const gasPrice = await web3.eth.getGasPrice();
    const [from] = await web3.eth.getAccounts();
    const to = contract.options.address;
    const data = fn.encodeABI(from);
    const estimate = await fn.estimateGas();
    const gas = estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;
    const sig = await web3.eth.accounts.signTransaction(
        {
            gas,
            gasPrice,
            to,
            from,
            data,
        },
        privateKey,
    );

    if (sig.rawTransaction) {
        return await web3.eth.sendSignedTransaction(sig.rawTransaction);
    }
}

export function getERC20Contract(web3: Web3, address: string) {
    const abi: any = Artifacts.ERC20.abi;
    return new web3.eth.Contract(abi, address);
}

export function getAssetPoolContract(web3: Web3, address: string) {
    const abi: any = Artifacts.IDefaultDiamond.abi;
    return new web3.eth.Contract(abi, address);
}

export function isValidKey(privateKey: string) {
    try {
        const web3 = new Web3();
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);

        return isAddress(account.address);
    } catch (e) {
        return false;
    }
}

export async function getGasToken(web3: Web3, address: string) {
    const balanceInWei = await web3.eth.getBalance(address);

    return {
        name: 'Matic Token',
        symbol: 'MATIC',
        balance: fromWei(balanceInWei),
    };
}

export function isPrivateKey(privateKey: string) {
    const web3 = new Web3();

    try {
        if (!privateKey.startsWith('0x')) {
            throw new Error('Private key does not start with 0x');
        }
        if (privateKey.length !== 66) {
            throw new Error('Private key string lenght is not 66.');
        }

        web3.eth.accounts.privateKeyToAccount(privateKey);

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
