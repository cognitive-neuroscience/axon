import { TestBed } from '@angular/core/testing';
import * as commonMethodModule from 'src/app/common/commonMethods';
import { ImageService } from '../image.service';
import { DataGenerationService } from './data-generation.service';
import { getFaceNameAssociationStimuli } from './raw-data/face-name-association';
import {
    FaceNameAssociationTaskTrialtype,
    SARTStimuliSetType,
    SARTTrialType,
    SmileyFaceType,
    StroopStimulus,
} from './stimuli-models';

describe('Data Generation Service', () => {
    let service: DataGenerationService;
    let mockImagesAsBlobsFunc = jest.fn();

    beforeEach(() => {
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
            const generatedStimuli = getFaceNameAssociationStimuli('learning-phase');
            generatedStimuli.forEach((stimulus) => {
                expect(stimulus.personName).toEqual(stimulus.correctPersonName);
            });
        });

        it('should return the same data for intact trial type', () => {
            const stimuli = getFaceNameAssociationStimuli('learning-phase');
            jest.spyOn(commonMethodModule, 'shuffle').mockReturnValue(stimuli);

            const generatedStimuli = service.generateFaceNameAssociationTaskStimuli(
                FaceNameAssociationTaskTrialtype.INTACT
            );
            expect(generatedStimuli).toEqual(stimuli);
        });

        it('should generate the correct stimuli for recombined trial type', () => {
            const stimuli = getFaceNameAssociationStimuli('learning-phase');
            jest.spyOn(commonMethodModule, 'shuffle').mockReturnValue(stimuli);

            const generatedStimuli = service.generateFaceNameAssociationTaskStimuli(
                FaceNameAssociationTaskTrialtype.RECOMBINED
            );
            expect(generatedStimuli).toEqual(stimuli);
        });
    });
});
