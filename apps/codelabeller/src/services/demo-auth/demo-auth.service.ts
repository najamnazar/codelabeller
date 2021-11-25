import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DemoAccount, DemoAccountCheck, DemoAccountToken } from '@codelabeller/api-interfaces';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class DemoAuthService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };
  
  constructor(private configService: ConfigService, private http: HttpClient) { }

  async checkDemoAccountExists(email: string): Promise<DemoAccountCheck> {
    return await this.http.post<DemoAccountCheck>(
      `${await this.configService.getApiPrefix()}/demo-auth/account-exists`,
      {
        email: email
      },
      this.httpOptions
    ).toPromise();
  }

  async loginDemoAccount(email: string): Promise<DemoAccountToken> {
    return await this.http.post<DemoAccountToken>(
      `${await this.configService.getApiPrefix()}/demo-auth/login`,
      {
        email: email
      },
      this.httpOptions
    ).toPromise();
  }

  async createDemoAccount(): Promise<DemoAccount> {
    return await this.http.post<DemoAccount>(
      `${await this.configService.getApiPrefix()}/demo-auth/account`,
      {},
      this.httpOptions
    ).toPromise();
  }
}
