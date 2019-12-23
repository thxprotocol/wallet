import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/auth';

@Component({
    name: 'logout',
})
export default class Logout extends Vue {
    mounted() {
        firebase.auth().signOut().then(() => {
            this.$router.replace('login')
        })
    }
}