import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    constructor(
        private http: HttpClient,
    ) { }

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
