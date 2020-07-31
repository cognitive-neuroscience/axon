import { Injectable } from "@angular/core";
import { Observable, of } from 'rxjs';
import { Experiment } from '../models/Experiment';

@Injectable({
    providedIn: "root"
})
export class ExperimentsService {

    mockExperiments: Experiment[] = [
        {
            name: "Experiment 1",
            code: "349YNRRR",
            description: "My experiment 1",
            tasks: [
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                }
            ]
        },
        {
            name: "Experiment 2",
            code: "XYE44589",
            description: "My experiment 1",
            tasks: [
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                },
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                },
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                },
            ]
        },
        {
            name: "Experiment 3",
            code: "293FN223",
            description: "My experiment 1",
            tasks: [
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                }
            ]
        },
        {
            name: "Experiment 4",
            code: "0GN93409",
            description: "My experiment 1",
            tasks: [
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                },
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                }
            ]
        },
        {
            name: "Experiment 5",
            code: "023N0N03",
            description: "My experiment 1",
            tasks: [
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                },
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                },
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                },
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                }
            ]
        },
        {
            name: "Experiment 6",
            code: "WEFIWN3",
            description: "My experiment 1",
            tasks: [
                {
                    "title": "Stroop Task",
                    "description": "Description of Stroop Task",
                    "route": "/experiments/stroop",
                    "type": "NAB"
                }
            ]
        }
    ]

    getExperiments(): Observable<Experiment[]> {
        return of(this.mockExperiments);
    }

}