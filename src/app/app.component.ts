import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'axon';

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.navigate(['/dashboard']);
  }

}
