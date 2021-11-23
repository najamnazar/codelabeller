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

@Injectable()
export class ForbiddenResponseInterceptor implements HttpInterceptor {

  private hasShownMessage = false;

  constructor(private router: Router, private messageService: MessageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.router.navigate(["/forbidden"], { state: { logoutRequired: true } });

          if (!this.hasShownMessage) {
            this.hasShownMessage = true;
            this.messageService.add({ severity: 'error', sticky: true, summary: 'Forbidden', detail: `The operation you requested is not allowed. ${error.error.message ?? error.message}` });

            setTimeout(() => { this.hasShownMessage = false }, 5000);
          }
        }

        return throwError(error);
      }));
  }
}
