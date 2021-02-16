import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from 'src/app/models/InternalDTOs';
import { AuthService } from 'src/app/services/auth.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  constructor(
    private sessionStorageService: SessionStorageService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  logout() {
    this.sessionStorageService.clearSessionStorage()
    this.router.navigate(['/login'])
  }

}
