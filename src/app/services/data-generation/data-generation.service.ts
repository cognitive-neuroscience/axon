import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    deepClone,
    generateRandomNonrepeatingNumberList,
    getRandomNumber,
    selectNRandomElementsNoRepeats,
    shuffle,
} from 'src/app/common/commonMethods';
import { ImageService } from '../image.service';
import {
    OddballImageNames,
    OddballNonTargetStimulus,
    OddballStimulusPath,
    OddballTargetStimulus,
} from './raw-data/oddball-image-list';
import { RatingTaskActivities, RatingTaskQuestionList } from './raw-data/rating-task-data-list';
import {
    ChoiceTaskStimulus,
    DemandSelectionCounterbalance,
    DemandSelectionStimulus,
    DigitSpanStimulus,
    ImageBlob,
    NBackStimulus,
    OddballStimulus,
    RatingTaskStimuli,
    SARTStimulus,
    SARTStimuliSetType,
    SmileyFaceStimulus,
    SmileyFaceType,
    StroopStimulus,
    TaskSwitchingStimulus,
    TrailMakingStimulus,
    TrailMakingTrialType,
    SARTTrialType,
} from './stimuli-models';
import { NBackSet } from './raw-data/nback-data-list';
import { Color } from 'src/app/models/InternalDTOs';
import { DemandSelectionImageNames } from './raw-data/demand-selection-image-list';
import { DigitSpanStimuli } from './raw-data/digit-span-list';
import { TrailMakingSet } from './raw-data/trail-making-list';

@Injectable({
    providedIn: 'root',
})
export class DataGenerationService {
    constructor(private imageService: ImageService) {}

    generateRatingStimuli(numDoSomethingActivities: number): RatingTaskStimuli[] {
        const doSomethingActivities = selectNRandomElementsNoRepeats(
            RatingTaskActivities.DoSomething,
            numDoSomethingActivities
        );
        const doNothingActivities = deepClone(RatingTaskActivities.DoNothing);
        const activities = shuffle(doSomethingActivities.concat(doNothingActivities));

        const ratingTaskData: RatingTaskStimuli[] = activities.map((activity) => {
            const questions = shuffle(RatingTaskQuestionList);
            return {
                activity: activity,
                type: RatingTaskActivities.DoNothing.includes(activity) ? 'DoNothing' : 'DoSomething',
                questions: questions,
            };
        });

        return ratingTaskData;
    }

    generateChoiceStimuli(activities: string[]): ChoiceTaskStimulus[] {
        if (!activities.length || activities.length <= 2)
            throw new Error('At least two activities are needed to make a pair list');
        if (new Set<string>(activities).size !== activities.length) throw new Error('Cannot have duplicate activities');

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
                legend: ['Strongly Choose Left', 'Strongly Choose Right'],
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
                        'Number of total trials must be bigger or equal to the number of other types of trials'
                    );
                if (numNovelTrials > Object.keys(novelBlobs).length - scenesToExclude.length)
                    throw new Error('Cannot create given number of novel stimuli without repeats');

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
        // reference type - this reference will be cached, shared and modified with other oddball components
        scenesToExclude.push(scene);
        return scene;
    }

    // end of oddball data generation

    generateStroopStimuli(numTrials: number, numCongruent: number): StroopStimulus[] {
        if (numTrials < numCongruent) throw new Error('Number of congruent trials must be fewer than number of trials');

        const generatedStimuli: StroopStimulus[] = new Array(numTrials);
        const congruentIndices = generateRandomNonrepeatingNumberList(numCongruent, 0, numTrials);

        for (let i = 0; i < generatedStimuli.length; i++) {
            const color = this.getNewColor();
            const isCongruentTrial = congruentIndices.includes(i);

            if (isCongruentTrial) {
                generatedStimuli[i] = {
                    color: color,
                    congruent: true,
                    word: color,
                };
            } else {
                let nonCongruentColor = color;
                while (color === nonCongruentColor) {
                    nonCongruentColor = this.getNewColor();
                }

                generatedStimuli[i] = {
                    color: color,
                    congruent: false,
                    word: nonCongruentColor,
                };
            }
        }

        return generatedStimuli;
    }

    private getNewColor(): 'red' | 'blue' | 'green' {
        const num = getRandomNumber(0, 3);
        switch (num) {
            case 0:
                return 'red';
            case 1:
                return 'blue';
            case 2:
                return 'green';
            default:
                break;
        }
    }

    generateSmileyFaceStimuli(numShortFace: number, numLongFace: number): SmileyFaceStimulus[] {
        const trialSize = numShortFace + numLongFace;
        // select the indices that short faces will be shown at. The rest will be long faces
        const shortFaceIndices = generateRandomNonrepeatingNumberList(numShortFace, 0, trialSize);

        const trials: SmileyFaceStimulus[] = new Array(trialSize);

        for (let i = 0; i < trials.length; i++) {
            if (shortFaceIndices.includes(i)) {
                trials[i] = {
                    faceShown: SmileyFaceType.SHORT,
                };
            } else {
                trials[i] = {
                    faceShown: SmileyFaceType.LONG,
                };
            }
        }
        return trials;
    }

    generateNBackStimuli(isPractice: boolean, numTrials: number, counterbalance: number): NBackStimulus[] {
        const nbackSets = Object.keys(NBackSet);

        // subtract 1 because one set is the practice set
        if (counterbalance < 1 || counterbalance > nbackSets.length - 1) throw new Error('No such nback group exists');
        if (isPractice) {
            if (numTrials > NBackSet.practice.length)
                throw new Error('number of trials greater than number of practice trials');
            return NBackSet.practice.slice(0, numTrials);
        } else {
            const selectedSet = NBackSet[counterbalance] as NBackStimulus[];
            if (numTrials > selectedSet.length)
                throw new Error('number of trials greater than number of stroop trials');
            return selectedSet.slice(0, numTrials);
        }
    }

    // start of demand selection data generation

    generateDemandSelectionStimuli(
        numTrials: number,
        probOfShiftFirstPatch: number,
        probOfShiftSecondPatch: number,
        oddEvenColor: Color,
        ltGtColor: Color,
        usedColorStims: string[],
        counterbalance: DemandSelectionCounterbalance
    ): DemandSelectionStimulus[] {
        const firstPatchImg = this.getColorStim(usedColorStims);
        const secondPatchImg = this.getColorStim(usedColorStims);
        const rotation = getRandomNumber(0, 360);

        let demandSelectionStimuli: DemandSelectionStimulus[] = new Array(numTrials);
        for (let index = 0; index < demandSelectionStimuli.length; index++) {
            if (index === 0) {
                demandSelectionStimuli[index] = {
                    firstPatchImgName: firstPatchImg,
                    secondPatchImgName: secondPatchImg,
                    firstPatch: getRandomNumber(0, 10) < 5 ? oddEvenColor : ltGtColor,
                    secondPatch: getRandomNumber(0, 10) < 5 ? oddEvenColor : ltGtColor,
                    digit: this.getDigit(null),
                    counterbalance: counterbalance,
                    rotation: rotation, // choose a degree of rotation between 0 and 359 (because 0 and 360 are the same)
                };
            } else {
                // selecting what was NOT the color for the previous patches
                const prevTrial = demandSelectionStimuli[index - 1];
                const prevTrialNoneFirstPatchColor = prevTrial.firstPatch === oddEvenColor ? ltGtColor : oddEvenColor;
                const prevTrialNoneSecondPatchColor = prevTrial.secondPatch === oddEvenColor ? ltGtColor : oddEvenColor;
                demandSelectionStimuli[index] = {
                    firstPatchImgName: firstPatchImg,
                    secondPatchImgName: secondPatchImg,
                    firstPatch: this.shouldShift(probOfShiftFirstPatch)
                        ? prevTrialNoneFirstPatchColor
                        : prevTrial.firstPatch,
                    secondPatch: this.shouldShift(probOfShiftSecondPatch)
                        ? prevTrialNoneSecondPatchColor
                        : prevTrial.secondPatch,
                    digit: this.getDigit(prevTrial.digit),
                    counterbalance: counterbalance,
                    rotation: rotation,
                };
            }
        }
        return demandSelectionStimuli;
    }

    private getColorStim(usedColorStims: string[]): string {
        if (usedColorStims.length >= DemandSelectionImageNames.length)
            throw new Error('no more color stims to retrieve for demand selection');

        let randColorStim = DemandSelectionImageNames[getRandomNumber(0, DemandSelectionImageNames.length)];
        while (usedColorStims.includes(randColorStim)) {
            randColorStim = DemandSelectionImageNames[getRandomNumber(0, DemandSelectionImageNames.length)];
        }
        // reference type - this reference will be cached, shared and modified with other demand selection components
        usedColorStims.push(randColorStim);
        return randColorStim;
    }

    private getDigit(prevDigit: number): number {
        let digit = getRandomNumber(0, 10);
        //  digits are 1,2,3,4,6,7,8,9 - don't repeat same digit twice
        while (digit === 0 || digit === 5 || digit === prevDigit) {
            digit = getRandomNumber(0, 10);
        }
        return digit;
    }

    // probability represents a number that is a percentage (i.e. 25 is 25%).
    // calculates whether or not the patch should change
    private shouldShift(probability: number): boolean {
        if (probability < 0 || probability > 100)
            throw new Error('could not calculate shouldShift in demandselection. Invalid probability');
        const prob = 100 - probability;
        const randNum = getRandomNumber(0, 100);
        return randNum >= prob;
    }

    // end of demand selection data generation

    generateTaskSwitchingStimuli(
        numTrials: number,
        probOfShift: number,
        oddEvenColor: Color,
        ltGtColor: Color
    ): TaskSwitchingStimulus[] {
        let color = getRandomNumber(0, 2) === 1 ? oddEvenColor : ltGtColor;

        //  digits are 1,2,3,4,6,7,8,9 - don't repeat same digit twice
        const stimuli: TaskSwitchingStimulus[] = new Array(numTrials);
        for (let i = 0; i < stimuli.length; i++) {
            // the first time needs to be null
            const digit = this.getDigit(i === 0 ? null : stimuli[i - 1].digit);

            if (this.shouldShift(probOfShift)) color = color === oddEvenColor ? ltGtColor : oddEvenColor;

            stimuli[i] = {
                digit: digit,
                color: color,
            };
        }
        return stimuli;
    }

    generateDigitSpanStimuli(isPractice: boolean, useForwardSequence: boolean): DigitSpanStimulus[] {
        if (isPractice) {
            return useForwardSequence
                ? DigitSpanStimuli.practice.forwardSequence
                : DigitSpanStimuli.practice.backwardSequence;
        } else {
            return useForwardSequence
                ? DigitSpanStimuli.actual.forwardSequence
                : DigitSpanStimuli.actual.backwardSequence;
        }
    }

    generateTrailMakingStimuli(isPractice: boolean, trialType: TrailMakingTrialType): TrailMakingStimulus {
        if (isPractice) {
            return trialType === TrailMakingTrialType.ALPHANUMERIC
                ? TrailMakingSet.alphanumeric.practice
                : TrailMakingSet.numeric.practice;
        } else {
            return trialType === TrailMakingTrialType.ALPHANUMERIC
                ? TrailMakingSet.alphanumeric.actual
                : TrailMakingSet.numeric.actual;
        }
    }

    generateSARTStimuli(trialType: SARTStimuliSetType, trialLength: number, nogoTrialNum?: number): SARTStimulus[] {
        const fontSizeOptions = [48, 72, 95, 100, 120];
        const stimuli: SARTStimulus[] = new Array(trialLength);
        const nogoStimulus = 3;

        if (trialType === SARTStimuliSetType.ASCENDING) {
            for (let i = 0; i < trialLength; i++) {
                stimuli[i] = {
                    digit: (i % 9) + 1,
                    fontSize: fontSizeOptions[getRandomNumber(0, fontSizeOptions.length)],
                    trialType: (i % 9) + 1 === nogoStimulus ? SARTTrialType.NOGO : SARTTrialType.GO,
                };
            }
        } else {
            const nogoIndices = generateRandomNonrepeatingNumberList(nogoTrialNum || 25, 0, trialLength);
            for (let i = 0; i < trialLength; i++) {
                const isNoGo = nogoIndices.includes(i);
                let generatedDigit;
                if (isNoGo) {
                    generatedDigit = nogoStimulus;
                } else {
                    generatedDigit = getRandomNumber(1, 10);
                    while (generatedDigit === 3) generatedDigit = getRandomNumber(1, 10);
                }
                stimuli[i] = {
                    digit: generatedDigit,
                    fontSize: fontSizeOptions[getRandomNumber(0, fontSizeOptions.length)],
                    trialType: isNoGo ? SARTTrialType.NOGO : SARTTrialType.GO,
                };
            }
        }
        return stimuli;
    }
}
