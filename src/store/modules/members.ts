import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';
import { Account } from '@/models/Account';
import UserService from '@/services/UserService';

export interface MembersModuleState {
    all: any;
}
const userService = new UserService();

@Module({ namespaced: true })
class MembersModule extends VuexModule implements MembersModuleState {
    public all: any = {};

    get find() {
        return (id: string) => {
            return { user: id };
        };
    }
    get findByAddress() {
        return (address: string) => {
            for (const key of Object.keys(this.all)) {
                if (this.all[key].address === address) {
                    return this.all[key];
                }
            }
            console.log(`${address} not found`);
        };
    }

    @Mutation
    public setMember(member: Account) {
        Vue.set(this.all, member.uid, member);
    }

    @Action({ commit: 'setMember' })
    public async loadByAddress(address: string) {
        const member = await userService.getMemberByAddress(address);
        const account: Account = new Account(member.uid, address);
        return account;
    }
}

export default MembersModule;
