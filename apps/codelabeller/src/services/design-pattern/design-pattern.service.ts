import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDesignPattern } from '@codelabeller/api-interfaces';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class DesignPatternService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private http: HttpClient, private configService: ConfigService) { }

  async getDesignPatterns() {
    return await this.http.get<IDesignPattern[]>(`${await this.configService.getApiPrefix()}/design-pattern`).toPromise();
  }

  async getAllDesignPatterns() {
    return await this.http.get<IDesignPattern[]>(`${await this.configService.getApiPrefix()}/design-pattern/all`).toPromise();
  }

  async addDesignPatternAsAdmin(designPattern: IDesignPattern): Promise<IDesignPattern> {
    return this.http.post<IDesignPattern>(
      `${await this.configService.getApiPrefix()}/design-pattern`,
      designPattern,
      this.httpOptions
    ).toPromise();
  }

  async updateDesignPatternAsAdmin(designPattern: IDesignPattern): Promise<IDesignPattern> {
    return this.http.put<IDesignPattern>(
      `${await this.configService.getApiPrefix()}/design-pattern/${designPattern.id}`,
      designPattern,
      this.httpOptions
    ).toPromise();
  }

  async deleteDesignPatternAsAdmin(designPattern: IDesignPattern): Promise<IDesignPattern> {
    return this.http.delete<IDesignPattern>(`${await this.configService.getApiPrefix()}/design-pattern/${designPattern.id}`).toPromise();
  }
}
