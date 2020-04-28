import Vue from 'vue';
import NetworkService from '@/services/NetworkService';
import StateService from '@/services/StateService';
import PoolService from '@/services/PoolService';
import UserService from '@/services/UserService';
import firebase from 'firebase/app';

declare module 'vue/types/vue' {
    interface Vue {
        $timer;
        $network: NetworkService;
        $state: StateService;
        $pools: PoolService;
        $users: UserService;
    }
}
