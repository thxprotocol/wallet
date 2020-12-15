import axios from 'axios';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { account, maticWeb3 } from './network';
import { API_URL, GAS_STATION_ADDRESS } from './secrets';
import * as GAS_STATION from '../artifacts/GasStation.json';

export const gasStation = new maticWeb3.eth.Contract(GAS_STATION.abi as any, GAS_STATION_ADDRESS);

export interface QR {
    contract: string;
    assetPoolAddress: string;
    contractAddress: string;
    method: string;
    params: {
        agree: boolean;
        reward_id: number;
        id: number;
        withdrawAmount: number;
        withdrawDuration: number;
    };
}

async function createCallSignature(
    gasStation: any,
    web3: Web3,
    account: any,
    abi: any,
    method: string,
    params: any[],
    contractAddress: string,
) {
    const nonce = Number(await gasStation.methods.getLatestNonce(account.address).call()) + 1;
    const contractInterface = new ethers.utils.Interface(abi);
    const call = contractInterface.encodeFunctionData(method, params);
    const hash = web3.utils.soliditySha3(call, contractAddress, GAS_STATION_ADDRESS, nonce) || '';
    const sig = web3.eth.accounts.sign(hash, account.privateKey);

    return {
        call,
        nonce,
        sig: sig.signature,
        contractAddress,
    };
}

export async function send(result: QR, params: any[], abi: any, url: string) {
    const data = await createCallSignature(
        gasStation,
        maticWeb3,
        account,
        abi,
        result.method,
        params,
        result.contractAddress,
    );
    return await axios({
        url: `${API_URL}/gas_station/${url}`,
        method: 'post',
        headers: {
            AssetPool: result.assetPoolAddress,
        },
        data,
    });
}
