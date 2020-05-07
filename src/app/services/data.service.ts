import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from '../models/Data';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    experiments: Data = new Data();

    constructor(
        private http: HttpClient,
    ) { }

    retrieveData() {
        this.http.get('/assets/data/data.json').subscribe((response: Data) => {
            this.experiments = response;
            localStorage.setItem('mapping', Math.random() > 0.5 ? '1' : '2');
        }, (error) => {
            console.error(error);
        })
    }
}
