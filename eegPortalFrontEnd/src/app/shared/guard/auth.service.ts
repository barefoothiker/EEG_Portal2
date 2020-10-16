import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';

export const TOKEN_NAME: string = 'token';

@Injectable()
export class AuthService {

  private url: string = 'api/auth';
  private headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getToken(): string {
    return localStorage.getItem(TOKEN_NAME);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_NAME, token);
  }

  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
    return new Date();
  }

  isTokenExpired(token?: string): boolean {
    console.log(" in token expired " + token);
    if(!token) token = this.getToken();
    if(!token) return true;

    const date = this.getTokenExpirationDate(token);
    console.log(" date in token expired " + date.valueOf() + " now " + (new Date().valueOf()) );
    console.log(!(date.valueOf() > new Date().valueOf()));
    if(date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  // login(user): Promise<string> {
  //   return this.http
  //     .post(`${this.url}/login`, JSON.stringify(user), { headers: this.headers })
  //     .toPromise()
  //     .then(res => res.text());
  // }

}
