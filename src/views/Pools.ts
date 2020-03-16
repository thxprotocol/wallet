import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import { BCard, BCardText, BSpinner, BModal } from 'bootstrap-vue';
import NetworkService from '@/services/NetworkService';
import BN from 'bn.js';
import { mapGetters } from 'vuex';
import { Account } from '@/models/Account';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'pools',
    components: {
        'b-modal': BModal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
            account: 'account',
        }),
    },
})
export default class Pools extends Vue {
    public loading: boolean = false;
    public error: string = '';
    public input: any = {
        poolAddress: '',
    };
    private account!: Account;
    private $network!: NetworkService;

    private joinRewardPool(address: string) {
        const utils: any = this.$network.web3js.utils;

        if (utils.isAddress(address)) {
            this.loading = true;

            firebase.database().ref(`users/${this.account.uid}/pools`).child(address)
                .set({ address })
                .then(() => {
                    this.loading = false;
                    (this.$refs.modalJoinPool as BModal).hide();
                })
                .catch((err: string) => {
                    this.loading = false;
                    this.error = err;
                });
        }
    }

    private leaveRewardPool(poolAddress: string) {
        firebase.database().ref(`users/${this.account.uid}/pools`).child(poolAddress)
            .remove()
            .then(() => {
                this.$store.commit('removeRewardPool', poolAddress);
            })
            .catch((err: string) => {
                this.error = err;
            });
    }
}
