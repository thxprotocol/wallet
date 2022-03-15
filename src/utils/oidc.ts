import { AUTH_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, BASE_URL } from './secrets';

export const config: any = {
    authority: AUTH_URL,
    client_id: OIDC_CLIENT_ID, // eslint-disable-line @typescript-eslint/camelcase
    client_secret: OIDC_CLIENT_SECRET, // eslint-disable-line @typescript-eslint/camelcase
    redirect_uri: `${BASE_URL}/signin-oidc`, // eslint-disable-line @typescript-eslint/camelcase
    response_type: 'code', // eslint-disable-line @typescript-eslint/camelcase
    id_token_signed_response_alg: 'RS256', // eslint-disable-line @typescript-eslint/camelcase
    post_logout_redirect_uri: BASE_URL, // eslint-disable-line @typescript-eslint/camelcase
    silent_redirect_uri: `${BASE_URL}/silent-renew`, // eslint-disable-line @typescript-eslint/camelcase
    automaticSilentRenew: true,
    loadUserInfo: false,
    scope: 'openid user deposits:read deposits:write',
};
