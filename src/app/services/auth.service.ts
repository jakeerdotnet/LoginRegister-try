import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt'
import { TokenApiModel } from '../models/token-api.model';
import { SendOtpModel } from '../models/send-otp.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInCache: boolean | null = null;

  private baseUrl:string = "https://localhost:7207/api/Users/";
  private otpBaseUrl:string = "https://www.fast2sms.com/dev/bulkV2"
  private userPayload:any;
  constructor(private http : HttpClient, private router: Router) { 
    this.userPayload = this.decodeToken();
  }

  signup(userObj : any){
    return this.http.post<any>(`${this.baseUrl}register`,userObj)
  }

  login(loginObj: any){
    return this.http.post<any>(`${this.baseUrl}authenticate`,loginObj)
  }
  storeToken(tokenValue: string){
    localStorage.setItem('token', tokenValue)
  }
  storeRefreshToken(tokenValue: string){
    localStorage.setItem('refreshToken', tokenValue)
  }
  getToken(){
    return localStorage.getItem('token')
  }
  getRefreshToken(){
    return localStorage.getItem('refreshToken')
  }
  isLoggedIn(): boolean {
    if (this.isLoggedInCache !== null) {
      return this.isLoggedInCache;
    }

    // Example: Check local storage or token validation
    this.isLoggedInCache = !!localStorage.getItem('token');
    return this.isLoggedInCache;
  }
  signOut(){
    localStorage.clear();
    this.router.navigate(['/login'])
  }
  decodeToken(){
    const jwtHelper = new JwtHelperService();
    const token = this.getToken()!;
    console.log(jwtHelper.decodeToken(token))
    return jwtHelper.decodeToken(token)
  }

  getFullNameFromToken(){
    if(this.userPayload)
      return this.userPayload.unique_name;
  }
  getRoleFromToken(){
    if(this.userPayload)
      return this.userPayload.role;
  }
  renewToken(tokenApi : TokenApiModel){
    return this.http.post<any>(`${this.baseUrl}refresh`,tokenApi)
  }

  sendOtp(otpModel : SendOtpModel){
    return this.http.post<any>(this.otpBaseUrl, otpModel, {headers: this.getHeaders()})
  }

  getHeaders(){
    let headers = new HttpHeaders({
      'authorization': 'QYrg3nNEohqxDA41ICbmuPUtXFz0JB8OVk2fdlZ7vWKiMcyaR6Dq9OHNAcTLkQ6SCguFt8mBzXRa1y2E',
      'Content-Type': 'application/json'
    })
    return headers;
  }
}
