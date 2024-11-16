import { deepClone, getRandomNumber, shuffle } from 'src/app/common/commonMethods';
import { FaceNameAssociationStimulus, FaceNameAssociationTaskTrialtype } from '../stimuli-models';

function stimulusSet1Names() {
    return {
        maleNames: [
            'Thomas',
            'Oliver',
            'Theodore',
            'Leo',
            'Zachary',
            'Daniel',
            'Jonathan',
            'Henry',
            'Justin',
            'Andrew',
            'Kevin',
            'Mason',
        ],
        femaleNames: [
            'Amelia',
            'Sarah',
            'Rachel',
            'Megan',
            'Mila',
            'Vanessa',
            'Lauren',
            'Samantha',
            'Julia',
            'Ella',
            'Abigail',
            'Elizabeth',
        ],
    };
}

function stimulusSet2Names() {
    return {
        maleNames: [
            'Benjamin',
            'Brandon',
            'Logan',
            'Liam',
            'Jack',
            'Nicholas',
            'Kevin',
            'Gabriel',
            'Christopher',
            'Samuel',
            'Nathan',
            'William',
        ],
        femaleNames: [
            'Amanda',
            'Chloe',
            'Ava',
            'Stephanie',
            'Alyssa',
            'Evelyn',
            'Laura',
            'Victoria',
            'Mia',
            'Madison',
            'Olivia',
            'Kayla',
        ],
    };
}

function stimulusSetImages() {
    return {
        femaleImages: [
            '1-AF.jpg',
            '2-AF.jpg',
            '3-AF.jpg',
            '4-BF.jpg',
            '5-BF.jpg',
            '6-BF.jpg',
            '7-LF.jpg',
            '8-LF.jpg',
            '9-LF.jpg',
            '10-WF.jpg',
            '11-WF.jpg',
            '12-WF.jpg',
        ],
        maleImages: [
            '13-AM.jpg',
            '14-AM.jpg',
            '15-AM.jpg',
            '16-BM.jpg',
            '17-BM.jpg',
            '18-BM.jpg',
            '19-LM.jpg',
            '20-LM.jpg',
            '21-LM.jpg',
            '22-WM.jpg',
            '23-WM.jpg',
            '24-WM.jpg',
        ],
    };
}

function getFaceNameAssociationNames(counterbalanceGroup: 1 | 2): {
    maleNames: string[];
    femaleNames: string[];
} {
    return counterbalanceGroup === 2 ? stimulusSet2Names() : stimulusSet1Names();
}

export function getLearningPhaseStimuli(counterbalance: 1 | 2): FaceNameAssociationStimulus[] {
    const { maleNames, femaleNames } = getFaceNameAssociationNames(counterbalance);
    const { maleImages, femaleImages } = stimulusSetImages();

    if (maleNames.length !== maleImages.length || femaleNames.length !== femaleImages.length)
        throw new Error("number of names and images don't match");

    const shuffledMaleNames = shuffle(maleNames);
    const shuffledMaleImages = shuffle(maleImages);
    const maleStimuli: FaceNameAssociationStimulus[] = shuffledMaleImages.map((image, index) => ({
        imageName: image,
        gender: 'M',
        displayedPersonName: shuffledMaleNames[index],
        actualPersonName: shuffledMaleNames[index],
        trialType: FaceNameAssociationTaskTrialtype.INTACT,
        imagePath: `/assets/images/stimuli/facenameassociation/${counterbalance}/male/${image}`,
    }));

    const shuffledFemaleNames = shuffle(femaleNames);
    const shuffledFemaleImages = shuffle(femaleImages);
    const femaleStimuli: FaceNameAssociationStimulus[] = shuffledFemaleImages.map((image, index) => ({
        imageName: image,
        gender: 'F',
        displayedPersonName: shuffledFemaleNames[index],
        actualPersonName: shuffledFemaleNames[index],
        trialType: FaceNameAssociationTaskTrialtype.INTACT,
        imagePath: `/assets/images/stimuli/facenameassociation/${counterbalance}/female/${image}`,
    }));

    return shuffle([...maleStimuli, ...femaleStimuli]);
}

export function recombineStimuliForTesting(
    stimuli?: FaceNameAssociationStimulus[],
    maxRecombinations: number = 6
): FaceNameAssociationStimulus[] {
    if (!stimuli) throw new Error('existing stimuli required for test phase');
    const newStimuli = deepClone(stimuli);
    const MAX_RECOMBINED_ALLOWED = maxRecombinations;

    let numMaleRecombined = 0;
    let numFemaleRecombined = 0;

    while (numFemaleRecombined !== 6 || numMaleRecombined !== 6) {
        const randomIndex = getRandomNumber(0, newStimuli.length);
        const randomIndexToSwap = getRandomNumber(0, newStimuli.length);
        if (randomIndex === randomIndexToSwap) continue;

        const randomStimulus = newStimuli[randomIndex];
        const randomStimulusToSwap = newStimuli[randomIndexToSwap];
        if (randomStimulus.gender !== randomStimulusToSwap.gender) continue;

        if (randomStimulus.gender === 'M' && numMaleRecombined >= MAX_RECOMBINED_ALLOWED) continue;
        if (randomStimulus.gender === 'F' && numFemaleRecombined >= MAX_RECOMBINED_ALLOWED) continue;

        // do swap
        const originalRandomStimulusType = randomStimulus.trialType;
        const originalRandomStimulusToSwapType = randomStimulusToSwap.trialType;
        newStimuli[randomIndex] = randomStimulusToSwap;
        randomStimulusToSwap.trialType = FaceNameAssociationTaskTrialtype.RECOMBINED;
        newStimuli[randomIndexToSwap] = randomStimulus;
        randomStimulus.trialType = FaceNameAssociationTaskTrialtype.RECOMBINED;

        if (randomStimulus.gender === 'M') {
            numMaleRecombined = newStimuli.filter(
                (s) => s.trialType === FaceNameAssociationTaskTrialtype.RECOMBINED
            ).length;
            if (numMaleRecombined > MAX_RECOMBINED_ALLOWED) {
                // revert as we are over our allowed limit
                newStimuli[randomIndex] = randomStimulus;
                newStimuli[randomIndexToSwap] = randomStimulusToSwap;
                randomStimulus.trialType = originalRandomStimulusType;
                randomStimulusToSwap.trialType = originalRandomStimulusToSwapType;
            }
        } else {
            numFemaleRecombined = newStimuli.filter(
                (s) => s.trialType === FaceNameAssociationTaskTrialtype.RECOMBINED
            ).length;
            if (numFemaleRecombined > MAX_RECOMBINED_ALLOWED) {
                // revert as we are over our allowed limit
                newStimuli[randomIndex] = randomStimulus;
                newStimuli[randomIndexToSwap] = randomStimulusToSwap;
                randomStimulus.trialType = originalRandomStimulusType;
                randomStimulusToSwap.trialType = originalRandomStimulusToSwapType;
            }
        }
    }

    return shuffle(newStimuli);
}
