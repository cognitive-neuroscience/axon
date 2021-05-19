import { Injectable } from "@angular/core";
import { deepClone, selectNRandomElementsNoRepeats, shuffle } from "src/app/common/commonMethods";
import { RatingTaskActivities, RatingTaskQuestionList } from "./rating-task/rating-task-data-list";
import { RatingTaskStimuli } from "./stimuli-models";

@Injectable({
    providedIn: "root",
})
export class DataGenerationService {
    constructor() {}

    generateRatingTaskData(): RatingTaskStimuli[] {
        const doSomethingActivities = selectNRandomElementsNoRepeats(RatingTaskActivities.DoSomething, 21);
        const doNothingActivities = deepClone(RatingTaskActivities.DoNothing);
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
}
