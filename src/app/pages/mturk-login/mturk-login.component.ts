import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mturk-login',
  templateUrl: './mturk-login.component.html',
  styleUrls: ['./mturk-login.component.scss']
})
export class MturkLoginComponent implements OnInit {

  workerId: string;

  constructor() { }

  ngOnInit(): void {
  }

}
