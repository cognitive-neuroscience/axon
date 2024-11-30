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

export function getNShuffledIndicesByGender(
    stimuli: FaceNameAssociationStimulus[],
    nIndices: number,
    gender: FaceNameAssociationStimulus['gender']
): { originalIndex: number; newIndex: number }[] {
    const originalIndices: number[] = [];
    while (originalIndices.length < nIndices) {
        const randomIndex = getRandomNumber(0, stimuli.length);
        const stimulus = stimuli[randomIndex];
        if (stimulus.gender === gender && !originalIndices.includes(randomIndex)) {
            originalIndices.push(randomIndex);
        }
    }

    let newIndices: number[] = shuffle(originalIndices);
    while (originalIndices.some((_, index) => originalIndices[index] === newIndices[index])) {
        newIndices = shuffle(originalIndices);
    }

    return originalIndices.map((originalIndex, index) => ({
        originalIndex: originalIndex,
        newIndex: newIndices[index],
    }));
}

export function recombineStimuliForTesting(
    stimuli?: FaceNameAssociationStimulus[],
    numRecombinationsPerGender: number = 6
): FaceNameAssociationStimulus[] {
    if (!stimuli) throw new Error('existing stimuli required for test phase');
    if (
        numRecombinationsPerGender > stimulusSetImages().maleImages.length ||
        numRecombinationsPerGender > stimulusSetImages().femaleImages.length
    )
        throw new Error('number of recombinations more than images');
    const newStimuli = deepClone(stimuli);

    let maleIndicesToRecombine = getNShuffledIndicesByGender(stimuli, numRecombinationsPerGender, 'M');
    maleIndicesToRecombine.forEach(({ originalIndex, newIndex }) => {
        const newName = newStimuli[newIndex].actualPersonName;
        newStimuli[originalIndex].displayedPersonName = newName;
        newStimuli[originalIndex].trialType = FaceNameAssociationTaskTrialtype.RECOMBINED;
    });

    let femaleIndicesToRecombine = getNShuffledIndicesByGender(stimuli, numRecombinationsPerGender, 'F');
    femaleIndicesToRecombine.forEach(({ originalIndex, newIndex }) => {
        const newName = newStimuli[newIndex].actualPersonName;
        newStimuli[originalIndex].displayedPersonName = newName;
        newStimuli[originalIndex].trialType = FaceNameAssociationTaskTrialtype.RECOMBINED;
    });

    return shuffle(newStimuli);
}
