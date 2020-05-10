import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from '../models/Data';
import { environment } from 'src/environments/environment';

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
        }, (error) => {
            console.error(error);
        })
    }

    uploadData(experiment: string, data: any) {
        this.http.post(`${environment.apiBaseURL}/upload?experiment=${experiment}`, data, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('token')
            }
        }).subscribe((response: any) => {
            console.log('Data Uploaded');
        }, (error) => {
            console.error(error);
        })
    }

}
