import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';

import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

@Component({
    name: 'App',
    components: {
        Header,
        Footer,
    },
})
export default class App extends Vue {
}
