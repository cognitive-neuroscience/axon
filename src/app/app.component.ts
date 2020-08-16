import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    // this.router.navigate(['/login']);
    // let token = localStorage.getItem('token');
    // if (token) {
    //   this.authService.validateToken(token).subscribe((response) => {
    //     this.router.navigate(['/dashboard'])
    //   });
    // }
  }

}
