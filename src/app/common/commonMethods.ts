// generates a list of length <size> of non repeating random numbers

import { RouteMap } from "../routing/routes";

// random numbers generated are lowerbound inclusive and upperbound exclusive: [lowerbound, upperbound)
export function generateRandomNonrepeatingNumberList(size: number, lowerBound: number, upperBound: number): number[] {
    if (size > upperBound - lowerBound) throw new Error("Size cannot be greater than the bounds");
    const randList = [];
    while (randList.length < size) {
        const randNum = getRandomNumber(lowerBound, upperBound);
        if (!randList.includes(randNum)) {
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

// implementation of the Fisher-Yates shuffle
// returns a new array and does not modify the original
// https://bost.ocks.org/mike/shuffle/
export function shuffle<T>(array: T[]): T[] {
    const arr = deepClone(array);

    let randIndex: number;
    let temp: T;

    for (let i = arr.length - 1; i >= 0; i--) {
        // select random element in the left side of the array (smaller than i)
        randIndex = Math.floor(Math.random() * i);

        // swap items
        temp = arr[i];
        arr[i] = arr[randIndex];
        arr[randIndex] = temp;
    }
    return arr;
}

export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

// returns a new array and does not modify the original
export function selectNRandomElementsNoRepeats<T>(array: T[], numItems: number): T[] {
    const arr = deepClone(array);

    if (numItems <= 0 || arr.length === 0) return []; // input not valid
    if (arr.length <= numItems) return shuffle(arr); // if array length === numItems, it's the same as a shuffle operation

    let randIndex: number;
    let temp: T;

    for (let i = arr.length - 1; i >= arr.length - numItems; i--) {
        // select random element in the left side of the arr (smaller than i)
        randIndex = Math.floor(Math.random() * i);

        // swap items
        temp = arr[i];
        arr[i] = arr[randIndex];
        arr[randIndex] = temp;
    }
    return arr.slice(arr.length - numItems, arr.length);
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
    RouteMap.stressPilot.id,
];
// remove later, this is a bandaid fix
export function isConsent(id: string): boolean {
    return ConsentIds.includes(id);
}

export function thisOrDefault(value: any, defaultValue: any): any {
    return value === null || value === undefined ? defaultValue : value;
}
