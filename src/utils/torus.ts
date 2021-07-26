import DirectWebSdk, { TorusKey, TORUS_NETWORK_TYPE } from '@toruslabs/torus-direct-web-sdk';
import { User } from 'oidc-client';
import { TORUS_NETWORK, TORUS_VERIFIER } from './secrets';

export async function getPrivateKey(user: User) {
    if (TORUS_VERIFIER == 'thx-email-password-testnet') {
        return process.env.VUE_APP_TEST_KEY
            ? {
                  privateKey: process.env.VUE_APP_TEST_KEY,
              }
            : {
                  error: 'VUE_APP_TEST_KEY is not set',
              };
    }

    const torus = new DirectWebSdk({
        baseUrl: `${location.origin}/serviceworker`,
        enableLogging: false,
        network: TORUS_NETWORK as TORUS_NETWORK_TYPE,
    });

    try {
        const torusKey: TorusKey = await torus.getTorusKey(
            TORUS_VERIFIER,
            user.profile.sub,
            { verifier_id: user.profile.sub }, // eslint-disable-line @typescript-eslint/camelcase
            user.access_token,
        );
        return {
            privateKey: `0x${torusKey.privateKey}`,
        };
    } catch (e) {
        return {
            error: e.toString(),
        };
    }
}
