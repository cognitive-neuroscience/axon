import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mturk-login',
  templateUrl: './mturk-login.component.html',
  styleUrls: ['./mturk-login.component.scss']
})
export class MturkLoginComponent implements OnInit {

  workerId: string = "";
  experimentCode: string = "";
  urlContainsCode: boolean = false;

  constructor(private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this._getQueryParams()
  }

  // If the url contains an experiment shortcode then we get it here.
  // Otherwise the user will be prompted to enter their own shortcode.
  private _getQueryParams() {
    this._route.queryParams.subscribe(params => {
      const urlCode = params['code']
      if(urlCode) {
        this.urlContainsCode = true
        this.experimentCode = urlCode;
      }
    })
  }

  startExperiment() {
    // call task manager service to start the experiment

  }

  // private experimentCodeIsValid(): boolean {
    
  // }

}
