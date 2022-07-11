import { UserManagerSettings } from 'oidc-client-ts';
import { API_ROOT, AUTH_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, BASE_URL } from './secrets';

export const config: UserManagerSettings = {
    authority: AUTH_URL,
    client_id: OIDC_CLIENT_ID,
    client_secret: OIDC_CLIENT_SECRET,
    redirect_uri: `${BASE_URL}/signin-oidc`,
    response_type: 'code',
    post_logout_redirect_uri: BASE_URL,
    silent_redirect_uri: `${BASE_URL}/signin-silent`,
    automaticSilentRenew: true,
    loadUserInfo: false,
    resource: API_ROOT,
    scope:
        'openid offline_access rewards:read erc20:read erc721:read withdrawals:read withdrawals:write deposits:read deposits:write account:read account:write memberships:read memberships:write promotions:read transactions:read relay:write claims:read',
};
