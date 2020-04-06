import Vue from 'vue';
import NetworkService from '@/services/NetworkService';
import StateService from '@/services/StateService';
import firebase from 'firebase/app';

declare module 'vue/types/vue' {
    interface Vue {
        $network: NetworkService;
        $state: StateService;
        $user: firebase.User;
    }
}
