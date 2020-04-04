import Vue from 'vue';
import NetworkService from '@/services/NetworkService';

declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
        $network: NetworkService;
    }
}
