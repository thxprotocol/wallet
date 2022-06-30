import { UserManagerSettings } from 'oidc-client-ts';
import { AUTH_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, BASE_URL } from './secrets';

export const config: UserManagerSettings = {
    authority: AUTH_URL,
    client_id: OIDC_CLIENT_ID, // eslint-disable-line @typescript-eslint/camelcase
    client_secret: OIDC_CLIENT_SECRET, // eslint-disable-line @typescript-eslint/camelcase
    redirect_uri: `${BASE_URL}/signin-oidc`, // eslint-disable-line @typescript-eslint/camelcase
    response_type: 'code', // eslint-disable-line @typescript-eslint/camelcase
    post_logout_redirect_uri: BASE_URL, // eslint-disable-line @typescript-eslint/camelcase
    silent_redirect_uri: `${BASE_URL}/silent-renew`, // eslint-disable-line @typescript-eslint/camelcase
    automaticSilentRenew: true,
    loadUserInfo: false,
    scope:
        'openid offline_access rewards:read erc20:read erc721:read withdrawals:read withdrawals:write deposits:read deposits:write account:read account:write memberships:read memberships:write promotions:read transactions:read relay:write',
};
