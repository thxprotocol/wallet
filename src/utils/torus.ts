import CustomAuth, { TorusKey, TORUS_NETWORK_TYPE } from '@toruslabs/customauth';
import { User } from 'oidc-client';
import { TORUS_NETWORK, TORUS_VERIFIER, VUE_APP_TEST_KEY } from './secrets';

export async function getPrivateKeyForUser(user: User) {
    if (VUE_APP_TEST_KEY) {
        return VUE_APP_TEST_KEY;
    }

    const torus = new CustomAuth({
        baseUrl: `${location.origin}/serviceworker`,
        enableLogging: false,
        network: TORUS_NETWORK as TORUS_NETWORK_TYPE,
    });

    const torusKey: TorusKey = await torus.getTorusKey(
        TORUS_VERIFIER,
        user.profile.sub,
        { verifier_id: user.profile.sub }, // eslint-disable-line @typescript-eslint/camelcase
        user.access_token,
    );

    return `0x${torusKey.privateKey}`;
}
