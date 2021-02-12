import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-study-components',
  templateUrl: './study-components.component.html',
  styleUrls: ['./study-components.component.scss']
})
export class StudyComponentsComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

}
