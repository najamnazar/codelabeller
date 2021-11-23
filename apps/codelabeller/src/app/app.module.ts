import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { HomeModule } from './home/home.module';
import { MyResponsesModule } from './my-responses/my-responses.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { ForbiddenModule } from './forbidden/forbidden.module';
import { LandingModule } from './landing/landing.module';
import { SettingsModule } from './settings/settings.module';
import { AuthTokenInterceptor } from '../interceptors/auth-token.interceptor';
import { SuccessResponseInterceptor } from '../interceptors/success-response.interceptor';
import { UnauthorisedResponseInterceptor } from '../interceptors/unauthorised-response.interceptor';
import { ForbiddenResponseInterceptor } from '../interceptors/forbidden-response.interceptor';

export function storageFactory() : OAuthStorage {
  return localStorage;
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    OAuthModule.forRoot(),
    LandingModule,
    AuthModule,
    ForbiddenModule,
    HomeModule,
    MyResponsesModule,
    AdminPanelModule,
    ToastModule,
    SettingsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SuccessResponseInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorisedResponseInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ForbiddenResponseInterceptor,
      multi: true
    },
    {
      provide: OAuthStorage,
      useFactory: storageFactory
    },
    AppService,
    MessageService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
