import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class UnauthorisedResponseInterceptor implements HttpInterceptor {

  private hasShownMessage = false;

  constructor(private router: Router, private authService: AuthService, private messageService: MessageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorTitle = 'Unauthorized';
        let errorMessage = `The operation you requested is not allowed. ${error.error.message ?? error.message}`;

        if (error.status === 401) {
          if (this.authService.isLoggedIn() && (new Date().getTime() >= this.authService.getIdTokenExpirationTime())) {
            localStorage.setItem("lastPage", this.router.url);
            errorTitle = 'Session Expired'
            errorMessage = `Please refresh the page and try again.`;
          }

          if (!this.hasShownMessage) {
            this.hasShownMessage = true;
            this.messageService.add({ severity: 'error', sticky: true, summary: errorTitle, detail: errorMessage });

            setTimeout(() => { this.hasShownMessage = false }, 5000);
          }
        }

        return throwError(error);
      }));
  }
}
