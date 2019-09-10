<template>
    <article class="region region-container">
        <p>Logging out...</p>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

export default {
    name: 'logout',
    data: function() {
        return {
        }
    },
    mounted() {
        firebase.auth().signOut().then(() => {
            this.$router.replace('login')
        })
    }
}
</script>
