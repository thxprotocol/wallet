import { RewardPool } from '@/models/RewardPool';
import { Account } from '@/models/Account';

export class Notification {
    public key: string;
    public address: string;
    public account: Account;
    public pool: RewardPool;
    public metadata!: NotificationMetadata;

    constructor(pool: RewardPool, address: string, key: string, account: Account, metadata: NotificationMetadata) {
        this.pool = pool;
        this.address = address;
        this.key = key;
        this.account = account;
        this.metadata = metadata;
    }
}

class NotificationMetadata {
    public message!: string;
    public reward!: number;
    public title!: string;
    public timestamp!: number;
    public uid!: string;
    public component!: string;
    public public!: boolean;
}
