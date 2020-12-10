import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { send, QR } from '@/utils/gasStation';
import * as BASE_POLL from '../../artifacts/BasePoll.json';

@Module({ namespaced: true })
class BasePollModule extends VuexModule {
    @Action
    async vote(result: QR) {
        return await send(result, [result.params.agree], BASE_POLL.abi, 'base_poll');
    }

    @Action
    async revokeVote(result: QR) {
        return await send(result, [], BASE_POLL.abi, 'base_poll');
    }

    @Action
    async finalize(result: QR) {
        return await send(result, [], BASE_POLL.abi, 'base_poll');
    }
}

export default BasePollModule;
