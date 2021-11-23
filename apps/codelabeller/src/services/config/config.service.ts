import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigResponse } from '@codelabeller/api-interfaces';
import { ReplaySubject } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly API_PREFIX = '/api/v1';

  private http: HttpClient;
  private cidConfig$: ReplaySubject<string> = new ReplaySubject(1);
  private apiHostConfig$: ReplaySubject<string> = new ReplaySubject(1);
  private apiPrefixConfig$: ReplaySubject<string> = new ReplaySubject(1);

  // https://stackoverflow.com/a/52856093
  constructor(private readonly httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend);
    this.getConfig();
  }

  private getConfig() {
    this.http.get<AppConfigResponse>(`${this.API_PREFIX}/config`)
      .subscribe(config => {
        this.cidConfig$.next(config.cid);
        this.apiHostConfig$.next(config.apiHost);
        this.apiPrefixConfig$.next(config.apiPrefix);
      });
  }

  async getOAuthClientId(): Promise<string> {
    return await this.getConfigItem(this.cidConfig$);
  }

  async getApiHost(): Promise<string> {
    return await this.getConfigItem(this.apiHostConfig$);
  }

  async getApiPrefix(): Promise<string> {
    return await this.getConfigItem(this.apiPrefixConfig$);
  }

  private async getConfigItem<T>(rs: ReplaySubject<T>): Promise<T> {
    let value: any = undefined;

    for await (const event of eachValueFrom(rs.asObservable())) {
      value = event; // Just need the first value.
      break;
    }

    return value;
  }
}
