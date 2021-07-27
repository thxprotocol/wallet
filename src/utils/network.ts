import Web3 from 'web3';
import { fromWei, isAddress } from 'web3-utils';
import Artifacts from '@/utils/artifacts';
import Contract from 'web3/eth/contract';

export const MINIMUM_GAS_LIMIT = 54680;

export enum NetworkProvider {
    Test = 0,
    Main = 1,
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
        if (privateKey.length !== 42) {
            throw new Error('Private key string lenght is not 42.');
        }

        web3.eth.accounts.privateKeyToAccount(privateKey);

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
