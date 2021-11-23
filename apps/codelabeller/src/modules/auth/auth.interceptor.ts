import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(public oAuthStorage: OAuthStorage, private oAuthService: OAuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.oAuthStorage.getItem('id_token');

    if (authToken && this.oAuthService.hasValidIdToken()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        }
      });
    }

    return next.handle(request);
  }
}
