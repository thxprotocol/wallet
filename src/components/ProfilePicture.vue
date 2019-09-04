<template>
    <div :class="`account-picture account-picture-${size} bg-yellow`">
        <img
            v-if="account.picture"
            width="100%"
            height="100%"
            class="rounded-circle"
            :src="account.picture.url"
            :alt="account.firstName + account.lastName" />
        <span v-if="!account.picture">{{ account.initials}}</span>
    </div>
</template>

<script>
import firebase from 'firebase';
import 'firebase/database';
import 'firebase/auth';

export default {
    name: 'ProfilePicture',
    data: function() {
        return {
            account: {
                firstName: '',
                lastName: '',
                picture: {
                    url: '',
                    name: '',
                },
                initials: '',
            }
        }
    },
    props: {
        uid: null,
        size: null,
    },
    created() {
        const userRef = firebase.database().ref(`users/${this.uid}`);

        userRef.once('value').then(s => {
            this.account = s.val();

            if (this.account.firstName && this.account.firstName) {
                this.account.initials = this.account.firstName.charAt(0) + this.account.lastName.charAt(0);
            }
        });

        userRef.on('child_added', (s) => {
            this.account[s.key] = s.val();
        });

        userRef.on('child_removed', (s) => {
            if (s.key === 'picture') this.account.picture = null;
        });
    }
}
</script>

<style lang="scss">
.account-picture {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #333;
    font-weight: bold;
    font-size: 1.5rem;

    &.account-picture-xs {
        width: 25px;
        height: 25px;
        max-width: 25px;
        max-height: 25px;
        font-size: 1rem;
    }

    &.account-picture-sm {
        width: 50px;
        height: 50px;
        max-width: 50px;
        max-height: 50px;
    }

    &.account-picture-lg {
        width: 100px;
        height: 100px;
        max-width: 100px;
        max-height: 100px;
        font-size: 2rem;
    }
}
</style>
