import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../modules/auth/auth.service';
import { ConfigService } from '../services/config/config.service';
import * as parseUrl from 'url-parse';

@Injectable()
export class SuccessResponseInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private configService: ConfigService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      tap(async (event) => {
        if (event instanceof HttpResponse) {
          if (event.url == null) {
            return;
          }

          const parsedUrl = parseUrl(event.url);
          const apiHost = await this.configService.getApiHost();

          if (parsedUrl.hostname.toLowerCase() === apiHost.toLowerCase()) {
            if (!this.authService.hasMadeSuccessfulRequests$.value) {
              this.authService.hasMadeSuccessfulRequests$.next(true);
            }
          }
        }
      }));
  }
}
