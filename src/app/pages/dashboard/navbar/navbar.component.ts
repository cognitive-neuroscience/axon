import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  logout() {
    this.sessionStorageService.clearSessionStorage()
    this.router.navigate(['/login'])
  }

}
