import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
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
import {
    ChoiceTaskStimulus,
    ImageBlob,
    OddballStimulus,
    RatingTaskStimuli,
    SmileyFaceStimulus,
    SmileyFaceType,
    StroopStimulus,
} from "./stimuli-models";
import { StroopSet } from "./raw-data/stroop-data-list";

@Injectable({
    providedIn: "root",
})
export class DataGenerationService {
    constructor(private imageService: ImageService) {}

    generateRatingStimuli(numDoSomethingActivities: number): RatingTaskStimuli[] {
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

    generateChoiceStimuli(activities: string[]): ChoiceTaskStimulus[] {
        if (!activities.length || activities.length <= 2)
            throw new Error("At least two activities are needed to make a pair list");
        if (new Set<string>(activities).size !== activities.length) throw new Error("Cannot have duplicate activities");

        const shuffledActivities = shuffle(activities);
        const pairs: ChoiceTaskStimulus[] = [];

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
    ): Observable<OddballStimulus[]> {
        const imagePaths = OddballImageNames.map((name) => `${OddballStimulusPath}${name}`);

        return this.imageService.loadImagesAsBlobs(imagePaths).pipe(
            map((blobs) => {
                const stimuli = new Array<OddballStimulus>(numTotalTrials);
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

    generateStroopStimuli(isPractice: boolean, numTrials: number, counterbalance: number): StroopStimulus[] {
        const stroopSets = Object.keys(StroopSet);

        // subtract 1 because one set is the practice set
        if (counterbalance < 1 || counterbalance > stroopSets.length - 1)
            throw new Error("No such stroop group exists");
        if (isPractice) {
            if (numTrials > StroopSet.practice.length)
                throw new Error("number of trials greater than number of practice trials");
            return StroopSet.practice.slice(0, numTrials);
        } else {
            const selectedSet = StroopSet[counterbalance] as StroopStimulus[];
            if (numTrials > selectedSet.length)
                throw new Error("number of trials greater than number of stroop trials");
            return selectedSet.slice(0, numTrials);
        }
    }

    generateSmileyFaceStimuli(
        numShortFace: number,
        numShortFaceRewarded: number,
        numLongFace: number,
        numLongFaceRewarded: number
    ): SmileyFaceStimulus[] {
        if (numShortFaceRewarded > numShortFace || numLongFaceRewarded > numLongFace)
            throw new Error("Num rewarded cannot be greater than the number of trials");

        const trialSize = numShortFace + numLongFace;
        // select the indices that short faces will be shown at. The rest will be long faces
        const shortFaceIndices = generateRandomNonrepeatingNumberList(numShortFace, 0, trialSize);
        // from those short faces, select a random subset
        const shortFaceRewardedTrials = generateRandomNonrepeatingNumberList(numShortFaceRewarded, 0, numShortFace);
        // out of the number of long faces, select a random subset that are rewarded
        const numLongFaceRewardedTrials = generateRandomNonrepeatingNumberList(numLongFaceRewarded, 0, numLongFace);

        let numLongFaces = 0;
        let numShortFaces = 0;
        const trials: SmileyFaceStimulus[] = [];

        for (let i = 0; i < trialSize; i++) {
            if (shortFaceIndices.includes(i)) {
                trials.push({
                    faceShown: SmileyFaceType.SHORT,
                    isRewarded: !!shortFaceRewardedTrials.includes(numShortFaces),
                    isRescheduledReward: false,
                });
                numShortFaces++;
            } else {
                trials.push({
                    faceShown: SmileyFaceType.LONG,
                    isRewarded: !!numLongFaceRewardedTrials.includes(numLongFaces),
                    isRescheduledReward: false,
                });
                numLongFaces++;
            }
        }

        return trials;
    }
}
