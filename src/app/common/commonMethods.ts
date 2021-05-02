// generates a list of length <size> of non repeating random numbers

import { RouteMap } from "../routing/routes";

// random numbers generated are lowerbound inclusive and upperbound exclusive: [lowerbound, upperbound)
export function generateRandomNonrepeatingNumberList(size: number, lowerBound: number, upperBound: number): number[] {
    if(size > (upperBound - lowerBound)) throw new Error("Size cannot be greater than the bounds")
    const randList = [];
    while(randList.length < size) {
        const randNum = getRandomNumber(lowerBound, upperBound);
        if(!randList.includes(randNum)) {
            randList.push(randNum);
        }
    }
    return randList;
}

// gets a random number: [lowerbound, upperbound)
export function getRandomNumber(lowerbound: number, upperbound: number): number {
    return Math.floor(Math.random() * (upperbound - lowerbound)) + lowerbound;
}

// gets the ascii value of the last ID letter, returning a boolean indicating if the result is even
export function idIsEven(id: string): boolean {
    const lastLetter = id[id.length - 1];
    return lastLetter.charCodeAt(0) % 2 == 0;
}

export function wait(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve();
        }, time);
    });
}

export function isSurveyMonkeyQuestionnaire(task: string): boolean {
    return task.includes(RouteMap.surveymonkeyquestionnaire.id);
}

export function isCustomTask(task: string): boolean {
    return task.includes(RouteMap.pavloviatask.id);
}

export const ConsentIds = [
    RouteMap.consent.id,
    RouteMap.webPhenoClinical.id,
    RouteMap.webPhenoClinicalFR.id,
    RouteMap.stressClinical.id,
    RouteMap.stressClinicalFR.id,
    RouteMap.stressClinicalDebrief.id,
    RouteMap.stressPilot.id
]
// remove later, this is a bandaid fix
export function isConsent(id: string): boolean {
    return ConsentIds.includes(id);
}