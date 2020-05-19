import firebase from 'firebase';
import 'firebase/database';
import 'firebase/storage';
import config from './config.json';

firebase.initializeApp(config.firebase[process.env.NODE_ENV as string]);

// firebase utils
const db = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();
const currentUser = auth.currentUser;

export default { db, auth, storage, currentUser };
