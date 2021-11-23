import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IOption } from '@codelabeller/api-interfaces';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class OptionService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private configService: ConfigService, private http: HttpClient) { }

  async getAllowUnlistedUsersAsAdmin(): Promise<IOption<boolean>> {
    return await this.http.get<IOption<boolean>>(`${await this.configService.getApiPrefix()}/option/unlistedUsersAllowed`).toPromise();
  }

  async putAllowUnlistedUsersAsAdmin(newValue: boolean): Promise<IOption<boolean>> {
    return this.http.put<IOption<boolean>>(
      `${await this.configService.getApiPrefix()}/option/unlistedUsersAllowed`,
      {
        value: newValue
      } as IOption<boolean>,
      this.httpOptions
    ).toPromise();
  }

  async getDefaultAreUploadedFilesEnabledAsAdmin(): Promise<IOption<boolean>> {
    return await this.http.get<IOption<boolean>>(`${await this.configService.getApiPrefix()}/option/uploadedFilesEnabledByDefault`).toPromise();
  }

  async putDefaultAreUploadedFilesEnabledAsAdmin(newValue: boolean): Promise<IOption<boolean>> {
    return this.http.put<IOption<boolean>>(
      `${await this.configService.getApiPrefix()}/option/uploadedFilesEnabledByDefault`,
      {
        value: newValue
      } as IOption<boolean>,
      this.httpOptions
    ).toPromise();
  }

  async getDefaultAreUploadedFilesAcceptingResponsesAsAdmin(): Promise<IOption<boolean>> {
    return await this.http.get<IOption<boolean>>(`${await this.configService.getApiPrefix()}/option/uploadedFilesAcceptingResponsesByDefault`).toPromise();
  }

  async putDefaultAreUploadedFilesAcceptingResponsesAsAdmin(newValue: boolean): Promise<IOption<boolean>> {
    return this.http.put<IOption<boolean>>(
      `${await this.configService.getApiPrefix()}/option/uploadedFilesAcceptingResponsesByDefault`,
      {
        value: newValue
      } as IOption<boolean>,
      this.httpOptions
    ).toPromise();
  }

  async getDefaultUploadedFilesNumRequiredResponsesAsAdmin(): Promise<IOption<number>> {
    return await this.http.get<IOption<number>>(`${await this.configService.getApiPrefix()}/option/uploadedFilesNumRequiredResponsesByDefault`).toPromise();
  }

  async putDefaultUploadedFilesNumRequiredResponsesAsAdmin(newValue: number): Promise<IOption<number>> {
    return this.http.put<IOption<number>>(
      `${await this.configService.getApiPrefix()}/option/uploadedFilesNumRequiredResponsesByDefault`,
      {
        value: newValue
      } as IOption<number>,
      this.httpOptions
    ).toPromise();
  }
}
