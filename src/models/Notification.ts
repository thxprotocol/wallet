import { RewardPool } from '@/models/RewardPool';
import { Account } from '@/models/Account';

export class Notification {
    public key: string;
    public address: string;
    public title: string;
    public timestamp: number;
    public account: Account;
    public pool: RewardPool;

    constructor(
        pool: RewardPool,
        address: string,
        key: string,
        account: Account,
        data: { title: string; timestamp: number; uid: string },
    ) {
        this.pool = pool;
        this.address = address;
        this.key = key;
        this.account = account;
        this.title = data.title;
        this.timestamp = data.timestamp;
    }
}
