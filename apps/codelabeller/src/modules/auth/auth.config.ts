import { AuthConfig } from 'angular-oauth2-oidc';
import { ConfigService } from '../../services/config/config.service';

export const getGoogleAuthConfig = async (configService: ConfigService): Promise<AuthConfig> => {
  return {
    issuer: 'https://accounts.google.com',
    clientId: (await (configService.getOAuthClientId())),
    redirectUri: window.location.origin + '/login',
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    scope: 'openid profile email',
    strictDiscoveryDocumentValidation: false,
    showDebugInformation: false,
    sessionChecksEnabled: false,
  }
};
