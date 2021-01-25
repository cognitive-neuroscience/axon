import { generateRandomNonrepeatingNumberList } from "../../../common/commonMethods";

export enum SmileyFaceType {
    SHORT = "SHORT",
    LONG = "LONG",
    NONE = "NONE"
}

export class SmileyFaceTrial {
    faceShown: SmileyFaceType;
    isRewarded: boolean;
}

export class SmileyFaceBlock {

    private trials: SmileyFaceTrial[] = [];
    private _currentTrial: SmileyFaceTrial;
    private _currentTrialIndex: number = -1;

    // iterate over the trials and increment to the next one
    getAndSetNextTrial(): SmileyFaceTrial {
        this._currentTrial = this.trials[++this._currentTrialIndex];
        return this._currentTrial;
    }

    getCurrentTrial(): SmileyFaceTrial {
        return this._currentTrial;
    }

    postponeReward(): void {
        const trialWhereUserWasIncorrect = this._currentTrial;

        // iterate through list until you find the next stimulus of the same type tha is unrewarded and reward that.
        // if none are found, we complete the iteration without assigning anything as we either have no more trials of that type,
        // or all are rewarded
        for(let i = this._currentTrialIndex + 1; i < this.trials.length; i++) {
            const trial = this.trials[i];
            if(trialWhereUserWasIncorrect.faceShown === trial.faceShown && !trial.isRewarded) {
                trial.isRewarded = true;
                return;
            }
        }
    }

    constructor(public numShortFace: number, public numShortFaceRewarded: number, public numLongFace: number, public numLongFaceRewarded) {
        if(numShortFaceRewarded > numShortFace || numLongFaceRewarded > numLongFace) throw new Error("Num rewarded cannot be greater than the number of trials");
        const trialSize = numShortFace + numLongFace;
        const shortFaceIndices = generateRandomNonrepeatingNumberList(numShortFace, 0, trialSize);
        const shortFaceRewardedTrials = generateRandomNonrepeatingNumberList(numShortFaceRewarded, 0, numShortFace);
        const numLongFaceRewardedTrials = generateRandomNonrepeatingNumberList(numLongFaceRewarded, 0, numLongFace);

        let numLongFaces = 0;
        let numShortFaces = 0;

        for(let i = 0; i < trialSize; i++) {
            if(shortFaceIndices.includes(i)) {

                this.trials.push({
                    faceShown: SmileyFaceType.SHORT,
                    isRewarded: shortFaceRewardedTrials.includes(numShortFaces) ? true : false
                })
                numShortFaces++;
            } else {
                this.trials.push({
                    faceShown: SmileyFaceType.LONG,
                    isRewarded: numLongFaceRewardedTrials.includes(numLongFaces) ? true : false
                })
                numLongFaces++;
            }
        }
    }
}