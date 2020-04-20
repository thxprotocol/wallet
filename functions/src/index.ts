import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

exports.createNotification = functions.database
    .ref('/pools/{poolAddress}/notifications/{key}/public')
    .onCreate(async (snap, context) => {
        let updates: { [ref: string]: { pool: string; removed: boolean } } = {};
        const data = {
            pool: context.params.poolAddress,
            removed: false,
        };

        // Checks if manager role is needed
        switch (snap.val()) {
            case false:
                const membersSnapshot = await admin
                    .database()
                    .ref(`/pools/${context.params.poolAddress}/members`)
                    .once('value');

                for (const uid in membersSnapshot.val()) {
                    updates[`/users/${uid}/notifications/${context.params.key}`] = data;
                }
                break;
            case true:
                const managersSnapshot = await admin
                    .database()
                    .ref(`/pools/${context.params.poolAddress}/managers`)
                    .once('value');

                for (const uid in managersSnapshot.val()) {
                    updates[`/users/${uid}/notifications/${context.params.key}`] = data;
                }
                break;
        }

        return admin.database().ref().update(updates);
    });
