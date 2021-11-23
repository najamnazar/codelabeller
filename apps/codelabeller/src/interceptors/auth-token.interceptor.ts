import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as parseUrl from 'url-parse';
import { ConfigService } from '../services/config/config.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(private oAuthStorage: OAuthStorage, private configService: ConfigService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const parsedUrl = parseUrl(request.url);

    return from(this.configService.getApiHost()).pipe(mergeMap((apiHost: string) => {
      // Only append authorization header if http request is being sent to our server.
      if (parsedUrl.hostname.toLowerCase() === apiHost.toLowerCase()) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${this.oAuthStorage.getItem('id_token')}`,
          }
        });
      }

      return next.handle(request);
    }));
  }
}
