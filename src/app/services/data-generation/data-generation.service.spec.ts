import { TestBed } from '@angular/core/testing';
import * as commonMethodModule from 'src/app/common/commonMethods';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { ImageService } from '../image.service';
import { DataGenerationService } from './data-generation.service';
import { getFaceNameAssociationStimuli } from './raw-data/face-name-association';
import {
    SARTStimuliSetType,
    SARTTrialType,
    SDMTImageEnum,
    SDMTImageToNumberMapping,
    SmileyFaceType,
    StroopStimulus,
} from './stimuli-models';
import { getSDMTRealStimuli } from './raw-data/sdmt-data-list';

describe('Data Generation Service', () => {
    let service: DataGenerationService;
    let mockImagesAsBlobsFunc = jest.fn();

    beforeEach(() => {
        jest.spyOn(commonMethodModule, 'shuffle').mockImplementation((arr) => arr);
        jest.spyOn(commonMethodModule, 'getRandomNumber').mockImplementation(() => 1);
        const mockImageService = {
            loadImagesAsBlobs: mockImagesAsBlobsFunc,
        };
        TestBed.configureTestingModule({
            providers: [DataGenerationService, { provide: ImageService, useValue: mockImageService }],
        });

        service = TestBed.inject(DataGenerationService);
    });

    it('should be instantiated', () => {
        expect(service).toBeTruthy();
    });

    describe('smiley face stimuli', () => {
        const numShortFaces = 50;
        const numLongFaces = 50;
        it('should generate the correct numbers of smiley face stimuli', () => {
            const smileyFaceStimuli = service.generateSmileyFaceStimuli(numShortFaces, numLongFaces);

            const numberShortFaces = smileyFaceStimuli.filter((x) => x.faceShown === SmileyFaceType.SHORT);
            const numberLongFaces = smileyFaceStimuli.filter((x) => x.faceShown === SmileyFaceType.LONG);
            const numberNoneFaces = smileyFaceStimuli.filter((x) => x.faceShown === SmileyFaceType.NONE);

            expect(numberShortFaces.length).toEqual(numShortFaces);
            expect(numberLongFaces.length).toEqual(numLongFaces);
            expect(numberNoneFaces.length).toEqual(0);
        });
    });

    describe('stroop task stimuli', () => {
        it('should throw an error if number of congruent trials is greater than number of trials', () => {
            const func = () => {
                service.generateStroopStimuli(1, 2);
            };
            expect(func).toThrow(new Error('Number of congruent trials must be fewer than number of trials'));
        });

        it('should generate the correct number of congruent trials', () => {
            const generatedStroopStimuli = service.generateStroopStimuli(60, 40);
            const numCongruentTrials = generatedStroopStimuli.reduce((acc: number, currVal: StroopStimulus) => {
                return currVal.congruent ? acc + 1 : acc;
            }, 0);
            expect(numCongruentTrials).toEqual(40);
            expect(generatedStroopStimuli.length).toEqual(60);
        });

        it('should generate the correct congruent and noncongruent trials', () => {
            const generatedStroopStimuli = service.generateStroopStimuli(60, 40);

            generatedStroopStimuli.forEach((element) => {
                element.congruent
                    ? expect(element.color).toEqual(element.word)
                    : expect(element.color).not.toEqual(element.word);
            });
        });
    });

    describe('SART stimuli', () => {
        it('should generate the correct ascending stimuli', () => {
            const generatedSARTStimuli = service.generateSARTStimuli(SARTStimuliSetType.ASCENDING, 225);
            expect(generatedSARTStimuli.length).toBe(225);
            for (let i = 0; i < 225; i++) {
                const thisTrial = generatedSARTStimuli[i];
                expect(thisTrial.digit).toBe((i % 9) + 1);

                if (thisTrial.digit === 3) {
                    expect(thisTrial.trialType).toBe(SARTTrialType.NOGO);
                } else {
                    expect(thisTrial.trialType).toBe(SARTTrialType.GO);
                }
            }
        });

        it('should generate the correct random stimuli', () => {
            const generatedSARTStimuli = service.generateSARTStimuli(SARTStimuliSetType.RANDOM, 225, 25);
            const nogoStimuliNum = generatedSARTStimuli.filter((stimulus) => stimulus.digit === 3);
            expect(nogoStimuliNum.length).toBe(25);

            const numZeros = generatedSARTStimuli.filter((stimulus) => stimulus.digit === 0);
            expect(numZeros.length).toBe(0);

            generatedSARTStimuli.forEach((stimulus) => {
                stimulus.digit === 3
                    ? expect(stimulus.trialType).toBe(SARTTrialType.NOGO)
                    : expect(stimulus.trialType).toBe(SARTTrialType.GO);
            });
        });
    });

    describe('FaceName Association Stimuli', () => {
        it('should have equivalent person and correctPerson names', () => {
            const generatedStimuli = service.generateFaceNameAssociationTaskStimuli('learning-phase');
            generatedStimuli.forEach((stimulus) => {
                expect(stimulus.personName).toEqual(stimulus.correctPersonName);
            });
        });

        it('should return the same data for intact trial type', () => {
            const stimuli = getFaceNameAssociationStimuli('learning-phase');
            const generatedStimuli = service.generateFaceNameAssociationTaskStimuli('learning-phase');
            expect(generatedStimuli).toEqual(stimuli);
        });

        it('should generate the correct stimuli for recombined trial type', () => {
            const stimuli = getFaceNameAssociationStimuli('test-phase');
            const generatedStimuli = service.generateFaceNameAssociationTaskStimuli('test-phase');
            expect(generatedStimuli).toEqual(stimuli);
        });
    });

    // describe('Probabilistic Learning Task', () => {
    //     function helper(
    //         primaryStimulusName: string,
    //         complementStimulusName: string,
    //         stimuli: PLTStimulus[]
    //     ): [number, number, number, number] {
    //         const numLeftPrimaryCorrect = stimuli.filter(
    //             (x) =>
    //                 x.correctStimulusName === primaryStimulusName &&
    //                 x.leftStimulusName === primaryStimulusName &&
    //                 x.rightStimulusName === complementStimulusName &&
    //                 x.leftOrRightCorrect === 'LEFT'
    //         );
    //         const numRightPrimaryCorrect = stimuli.filter(
    //             (x) =>
    //                 x.correctStimulusName === primaryStimulusName &&
    //                 x.leftStimulusName === complementStimulusName &&
    //                 x.rightStimulusName === primaryStimulusName &&
    //                 x.leftOrRightCorrect === 'RIGHT'
    //         );
    //         const numLeftPrimaryIncorrect = stimuli.filter(
    //             (x) =>
    //                 x.correctStimulusName === complementStimulusName &&
    //                 x.leftStimulusName === primaryStimulusName &&
    //                 x.rightStimulusName === complementStimulusName &&
    //                 x.leftOrRightCorrect === 'RIGHT'
    //         );
    //         const numRightPrimaryIncorrect = stimuli.filter(
    //             (x) =>
    //                 x.correctStimulusName === complementStimulusName &&
    //                 x.leftStimulusName === complementStimulusName &&
    //                 x.rightStimulusName === primaryStimulusName &&
    //                 x.leftOrRightCorrect === 'LEFT'
    //         );

    //         return [
    //             numLeftPrimaryCorrect.length,
    //             numRightPrimaryCorrect.length,
    //             numLeftPrimaryIncorrect.length,
    //             numRightPrimaryIncorrect.length,
    //         ];
    //     }

    //     it('should generate the correct stimuli for the practice trials', () => {
    //         const correctPrimaryStimulusName = 'G';
    //         const complementStimulusName = 'H';
    //         jest.spyOn(commonMethodModule, 'shuffle').mockImplementation((arr) => arr);
    //         const stimuli = service.generatePLTStimuli('practice-phase');

    //         const [numLeftPrimaryCorrect, numRightPrimaryCorrect, numLeftPrimaryIncorrect, numRightPrimaryIncorrect] =
    //             helper(correctPrimaryStimulusName, complementStimulusName, stimuli);

    //         expect(numLeftPrimaryCorrect).toEqual(4);
    //         expect(numRightPrimaryCorrect).toEqual(4);
    //         expect(numLeftPrimaryIncorrect).toEqual(1);
    //         expect(numRightPrimaryIncorrect).toEqual(1);
    //     });

    //     describe('training phase', () => {
    //         test.each([
    //             ['A', 'B', 20, 20, 5, 5],
    //             ['C', 'D', 18, 17, 7, 8],
    //             ['E', 'F', 15, 15, 10, 10],
    //         ])(
    //             'should generate the correct stimuli for the %s %s pair',
    //             (
    //                 first: string,
    //                 second: string,
    //                 expectedNumLeftPrimaryCorrect,
    //                 expectedNumRightPrimaryCorrect,
    //                 expectedNumLeftPrimaryIncorrect,
    //                 expectedNumRightPrimaryIncorrect
    //             ) => {
    //                 const correctPrimaryStimulusName = first;
    //                 const complementStimulusName = second;
    //                 const stimuli = service.generatePLTStimuli('training-phase');

    //                 const [
    //                     numLeftPrimaryCorrect,
    //                     numRightPrimaryCorrect,
    //                     numLeftPrimaryIncorrect,
    //                     numRightPrimaryIncorrect,
    //                 ] = helper(correctPrimaryStimulusName, complementStimulusName, stimuli);

    //                 expect(numLeftPrimaryCorrect).toEqual(expectedNumLeftPrimaryCorrect);
    //                 expect(numRightPrimaryCorrect).toEqual(expectedNumRightPrimaryCorrect);
    //                 expect(numLeftPrimaryIncorrect).toEqual(expectedNumLeftPrimaryIncorrect);
    //                 expect(numRightPrimaryIncorrect).toEqual(expectedNumRightPrimaryIncorrect);
    //             }
    //         );
    //     });

    //     describe('test phase', () => {
    //         test.each([
    //             ['A', 'B', 5, 5, 0, 0],
    //             ['C', 'D', 5, 5, 0, 0],
    //             ['E', 'F', 5, 5, 0, 0],
    //             ['A', 'C', 5, 5, 0, 0],
    //             ['A', 'D', 5, 5, 0, 0],
    //             ['A', 'E', 5, 5, 0, 0],
    //             ['A', 'F', 5, 5, 0, 0],
    //             ['B', 'C', 0, 0, 5, 5],
    //             ['B', 'D', 0, 0, 5, 5],
    //             ['B', 'E', 0, 0, 5, 5],
    //             ['B', 'F', 0, 0, 5, 5],
    //         ])(
    //             'should generate the correct stimuli for the %s %s pair',
    //             (
    //                 first: string,
    //                 second: string,
    //                 expectedNumLeftPrimaryCorrect,
    //                 expectedNumRightPrimaryCorrect,
    //                 expectedNumLeftPrimaryIncorrect,
    //                 expectedNumRightPrimaryIncorrect
    //             ) => {
    //                 const correctPrimaryStimulusName = `stimulus_${first}`;
    //                 const complementStimulusName = `stimulus_${second}`;
    //                 const stimuli = service.generatePLTStimuli('test-phase');

    //                 const [
    //                     numLeftPrimaryCorrect,
    //                     numRightPrimaryCorrect,
    //                     numLeftPrimaryIncorrect,
    //                     numRightPrimaryIncorrect,
    //                 ] = helper(correctPrimaryStimulusName, complementStimulusName, stimuli);

    //                 expect(numLeftPrimaryCorrect).toEqual(expectedNumLeftPrimaryCorrect);
    //                 expect(numRightPrimaryCorrect).toEqual(expectedNumRightPrimaryCorrect);
    //                 expect(numLeftPrimaryIncorrect).toEqual(expectedNumLeftPrimaryIncorrect);
    //                 expect(numRightPrimaryIncorrect).toEqual(expectedNumRightPrimaryIncorrect);
    //             }
    //         );
    //     });
    // });

    describe('Everyday Choice Task', () => {
        describe('Choicer', () => {
            it('should generate the correct trials', () => {
                const mockActivities: ITranslationText[] = [
                    {
                        en: 'A',
                        fr: 'A',
                    },
                    {
                        en: 'B',
                        fr: 'B',
                    },
                    {
                        en: 'C',
                        fr: 'C',
                    },
                    {
                        en: 'D',
                        fr: 'D',
                    },
                ];

                const stimuli = service.generateChoiceStimuli(mockActivities);

                expect(stimuli).toEqual([
                    { firstActivity: { en: 'B', fr: 'B' }, secondActivity: { en: 'A', fr: 'A' }, set: 'first' },
                    { firstActivity: { en: 'C', fr: 'C' }, secondActivity: { en: 'B', fr: 'B' }, set: 'first' },
                    { firstActivity: { en: 'D', fr: 'D' }, secondActivity: { en: 'C', fr: 'C' }, set: 'first' },
                    { firstActivity: { en: 'A', fr: 'A' }, secondActivity: { en: 'D', fr: 'D' }, set: 'first' },
                    { firstActivity: { en: 'C', fr: 'C' }, secondActivity: { en: 'A', fr: 'A' }, set: 'second' },
                    { firstActivity: { en: 'D', fr: 'D' }, secondActivity: { en: 'B', fr: 'B' }, set: 'second' },
                    { firstActivity: { en: 'A', fr: 'A' }, secondActivity: { en: 'C', fr: 'C' }, set: 'second' },
                    { firstActivity: { en: 'B', fr: 'B' }, secondActivity: { en: 'D', fr: 'D' }, set: 'second' },
                ]);
            });
        });
    });

    describe('SDMT stimuli generation', () => {
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        const imageToNumberMapping: SDMTImageToNumberMapping = {
            [SDMTImageEnum.IMAGE1]: '1',
            [SDMTImageEnum.IMAGE2]: '2',
            [SDMTImageEnum.IMAGE3]: '3',
            [SDMTImageEnum.IMAGE4]: '4',
            [SDMTImageEnum.IMAGE5]: '5',
            [SDMTImageEnum.IMAGE6]: '6',
            [SDMTImageEnum.IMAGE7]: '7',
            [SDMTImageEnum.IMAGE8]: '8',
            [SDMTImageEnum.IMAGE9]: '9',
        };
        it('should generate stimuli with at least one of each image per block fo 18', () => {
            const stimuli = getSDMTRealStimuli(imageToNumberMapping);

            expect(stimuli[0].length).toEqual(18 * 12);

            for (let i = 0; i < 12; i++) {
                const stimuliBlock = stimuli[0].slice(i * 18, (i + 1) * 18);

                for (const key of Object.keys(imageToNumberMapping)) {
                    expect(stimuliBlock.find((stimulus) => stimulus.imageURL === key));
                }
            }
        });

        it('should not have any repeats', () => {
            const stimuli = getSDMTRealStimuli(imageToNumberMapping)[0];
            stimuli.forEach((_, index) => {
                if (index === stimuli.length - 1) return;
                expect(stimuli[index].imageURL).not.toEqual(stimuli[index + 1]?.imageURL);
            });
        });
    });
});
