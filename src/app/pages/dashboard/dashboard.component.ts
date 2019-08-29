import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  experiments: any[] = [];
  questionnaires: any[] = [];
  workflows: any[] = [];
  displayedColumns: string[] = ['title', 'description']

  constructor() { }

  ngOnInit() {
  }

}
