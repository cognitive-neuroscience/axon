import { Injectable } from "@angular/core";
import { deepClone, getRandomNumber, selectNRandomElementsNoRepeats, shuffle } from "src/app/common/commonMethods";
import { RatingTaskActivities, RatingTaskQuestionList } from "./raw-data/rating-task-data-list";
import { ChoiceTaskStimuli, RatingTaskStimuli } from "./stimuli-models";

@Injectable({
    providedIn: "root",
})
export class DataGenerationService {
    constructor() {}

    generateRatingTaskData(numDoSomethingActivities: number): RatingTaskStimuli[] {
        const doSomethingActivities = selectNRandomElementsNoRepeats(
            RatingTaskActivities.DoSomething,
            numDoSomethingActivities
        );
        const doNothingActivities = deepClone(RatingTaskActivities.DoNothing.slice(0, 1));
        const activities = shuffle(doSomethingActivities.concat(doNothingActivities));

        const ratingTaskData: RatingTaskStimuli[] = activities.map((activity) => {
            const questions = shuffle(RatingTaskQuestionList);
            return {
                activity: activity,
                type: RatingTaskActivities.DoNothing.includes(activity) ? "DoNothing" : "DoSomething",
                questions: questions,
            };
        });

        return ratingTaskData;
    }

    generateChoiceTaskData(activities: string[]): ChoiceTaskStimuli[] {
        if (!activities.length || activities.length <= 2)
            throw new Error("At least two activities are needed to make a pair list");
        if (new Set<string>(activities).size !== activities.length) throw new Error("Cannot have duplicate activities");

        const shuffledActivities = shuffle(activities);
        const pairs: ChoiceTaskStimuli[] = [];

        for (let i = 0; i < shuffledActivities.length; i++) {
            let firstActivity = shuffledActivities[i];
            let secondActivity = shuffledActivities[(i + 1) % shuffledActivities.length];

            const shouldSwitch = getRandomNumber(0, 2) === 1;
            if (shouldSwitch) [firstActivity, secondActivity] = [secondActivity, firstActivity];

            pairs.push({
                firstActivity: firstActivity,
                secondActivity: secondActivity,
                legend: ["Strongly Choose Left", "Strongly Choose Right"],
            });
        }

        return shuffle(pairs);
    }
}
