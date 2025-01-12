import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { UserStoreService } from '../services/user-store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  public users:any = [];
  public fullName : string = "";
  public role : string = "";
  constructor(private auth : AuthService, private api : ApiService, private userStore : UserStoreService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
    this.userStore.getFullNameFromStore()
    // .subscribe(val=>{
    //   const fullNameFromToken = this.auth.getFullNameFromToken();
    //   this.fullName = val || fullNameFromToken
    // });
    // this.userStore.getRoleFromStore()
    // .subscribe(val => {
    //   const roleFromToken = this.auth.getRoleFromToken();
    //   this.role = val || roleFromToken
    // })
  }
  loadUsers(): void {
    let loggedInUser = this.auth.getUser();
    if(loggedInUser!=null){
      let loggedInUserJson = JSON.parse(loggedInUser);
      this.auth.getRecord(loggedInUserJson)
        .subscribe({
          next: (res) => {
            if (Array.isArray(res)) {
              this.fullName = res[0].name;
            }
            else {
              this.router.navigate(['/login']);
            }
          },
          error: (err) => {
            this.router.navigate(['/login']);
          }
        });
    }
  }

  logout(){
    this.auth.signOut();
  }
}
