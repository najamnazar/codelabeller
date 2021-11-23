import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';

import { ConfigService } from '../../services/config/config.service';
import { getGoogleAuthConfig } from './auth.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  hasMadeSuccessfulRequests$ = new BehaviorSubject<boolean | undefined>(undefined);

  constructor(
    private readonly configService: ConfigService,
    private readonly oAuthService: OAuthService,
    private readonly http: HttpClient
  ) { }

  async login(onLoggedInCallback?: () => void): Promise<boolean> {
    this.oAuthService.configure(await getGoogleAuthConfig(this.configService));
    this.oAuthService.customQueryParams = {
      prompt: 'select_account',
    };

    return this.oAuthService.loadDiscoveryDocumentAndLogin({
      onTokenReceived: context => {
        if (onLoggedInCallback) {
          this.hasMadeSuccessfulRequests$.next(false);
          onLoggedInCallback();
        }

        return context;
      }
    });
  }

  logout(): void {
    this.oAuthService.logOut(false);
    this.hasMadeSuccessfulRequests$.next(false);
  }

  isLoggedIn(): boolean {
    if (this.oAuthService.hasValidIdToken() && this.oAuthService.hasValidAccessToken()) {
      return true;
    }
    return false;
  }

  async isAdmin(): Promise<boolean> {
    return await this.http.get<boolean>(`${await this.configService.getApiPrefix()}/user/is-admin`).toPromise();
  }

  getIdentityClaims() {
    return this.oAuthService.getIdentityClaims();
  }

  getIdToken() {
    return this.oAuthService.getIdToken();
  }

  getIdTokenExpirationTime() {
    return this.oAuthService.getIdTokenExpiration();
  }

  getUserGivenName(): string {
    const claims = this.oAuthService.getIdentityClaims() as { [key: string]: string };
    return claims['given_name'];
  }
  
  getUserFamilyName(): string {
    const claims = this.oAuthService.getIdentityClaims() as { [key: string]: string };
    return claims['family_name'];
  }

  getUserDisplayName(): string {
    const claims = this.oAuthService.getIdentityClaims() as { [key: string]: string };
    return `${claims['given_name']} ${claims['family_name']}`;
  }

  getUserEmail(): string {
    const claims = this.oAuthService.getIdentityClaims() as { [key: string]: string };
    return claims['email'];
  }

  getUserProfileImageSrc(): string {
    const claims = this.oAuthService.getIdentityClaims() as { [key: string]: string };
    return claims['picture'];
  }
}
