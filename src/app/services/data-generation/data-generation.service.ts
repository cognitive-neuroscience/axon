import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
    deepClone,
    generateRandomNonrepeatingNumberList,
    getRandomNumber,
    selectNRandomElementsNoRepeats,
    shuffle,
} from "src/app/common/commonMethods";
import { ImageService } from "../image.service";
import {
    OddballImageNames,
    OddballNonTargetStimulus,
    OddballStimulusPath,
    OddballTargetStimulus,
} from "./raw-data/oddball-image-list";
import { RatingTaskActivities, RatingTaskQuestionList } from "./raw-data/rating-task-data-list";
import { ChoiceTaskStimuli, ImageBlob, OddballStimuli, RatingTaskStimuli } from "./stimuli-models";

@Injectable({
    providedIn: "root",
})
export class DataGenerationService {
    constructor(private http: HttpClient, private imageService: ImageService) {}

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

    // start of oddball data generation

    generateOddballData(
        numTargetTrials: number,
        numNovelTrials: number,
        numTotalTrials: number,
        scenesToExclude?: string[]
    ): Observable<OddballStimuli[]> {
        const imagePaths = OddballImageNames.map((name) => `${OddballStimulusPath}${name}`);

        return this.imageService.loadImagesAsBlobs(imagePaths).pipe(
            map((blobs) => {
                const stimuli = new Array<OddballStimuli>(numTotalTrials);
                const novelBlobs: ImageBlob = {};
                const targetBlob: ImageBlob = {};
                const nonTargetBlob: ImageBlob = {};

                blobs.forEach((element: Blob, index) => {
                    const name = OddballImageNames[index];
                    // separate out blobs into respective objects, creating map between name and assoc blob
                    switch (name) {
                        case OddballTargetStimulus:
                            targetBlob[OddballTargetStimulus] = element;
                            break;
                        case OddballNonTargetStimulus:
                            nonTargetBlob[OddballNonTargetStimulus] = element;
                            break;
                        default:
                            novelBlobs[name] = element;
                            break;
                    }
                });

                if (numTotalTrials - numTargetTrials - numNovelTrials < 0)
                    throw new Error(
                        "Number of total trials must be bigger or equal to the number of other types of trials"
                    );
                if (numNovelTrials > Object.keys(novelBlobs).length - scenesToExclude.length)
                    throw new Error("Cannot create given number of novel stimuli without repeats");

                // fill with non target trials
                stimuli.fill({
                    stimulus: OddballNonTargetStimulus,
                    blob: nonTargetBlob[OddballNonTargetStimulus],
                    isTarget: false,
                });

                // randomly assign indices to be target trials nad novel trials by choosing a list of random numbers
                const randIndices = generateRandomNonrepeatingNumberList(
                    numTargetTrials + numNovelTrials,
                    0,
                    numTotalTrials
                );

                // populate the array with target trials
                for (let i = 0; i < numTargetTrials; i++) {
                    const randIndex = randIndices[i];
                    stimuli[randIndex] = {
                        stimulus: OddballTargetStimulus,
                        blob: targetBlob[OddballTargetStimulus],
                        isTarget: true,
                    };
                }

                // populate the array with novel stimuli
                for (let i = numTargetTrials; i < numTargetTrials + numNovelTrials; i++) {
                    const novelStimuli = this.getNovelStimuli(scenesToExclude, novelBlobs);
                    const randIndex = randIndices[i];
                    stimuli[randIndex] = {
                        stimulus: novelStimuli,
                        blob: novelBlobs[novelStimuli],
                        isTarget: false,
                    };
                }

                return stimuli;
            })
        );
    }

    private getNovelStimuli(scenesToExclude: string[], novelBlobs: ImageBlob): string {
        const novelBlobKeys = Object.keys(novelBlobs);
        let scene = novelBlobKeys[getRandomNumber(0, novelBlobKeys.length)];

        while (scenesToExclude.includes(scene)) {
            scene = novelBlobKeys[getRandomNumber(0, novelBlobKeys.length)];
        }
        scenesToExclude.push(scene);
        return scene;
    }

    // end of oddball data generation
}
