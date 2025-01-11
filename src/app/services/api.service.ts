import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl:string = "https://mongodb-node-crud-example.vercel.app/"
  constructor(private http : HttpClient, private router: Router) { }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}`)
  }
}
