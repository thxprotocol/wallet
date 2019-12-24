import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';

export class RewardPool {
    public address: string = '';
    public name: string = '';
    public balance: number = 0;

    constructor(
        address: string,
        contract: any,
        owner: string,
    ) {
        this.address = address;

        contract.methods.name().call({ from: owner })
            .then((name: string) => {
                this.name = name;
            });
    }

    setBalance(amount: number) {
        this.balance = amount;
    }
}