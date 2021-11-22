import { TestBed } from '@angular/core/testing';
import { ImageService } from '../image.service';
import { DataGenerationService } from './data-generation.service';
import {
    SARTStimuliSetType,
    SARTTrialType,
    SmileyFaceStimulus,
    SmileyFaceType,
    StroopStimulus,
} from './stimuli-models';

describe('Data Generation Service', () => {
    let service: DataGenerationService;
    let fakeImageService: jasmine.SpyObj<ImageService>;
    beforeEach(() => {
        const spy = jasmine.createSpyObj('ImageService', ['loadImagesAsBlobs']);

        TestBed.configureTestingModule({
            providers: [DataGenerationService, { provide: ImageService, useValue: spy }],
        });

        service = TestBed.inject(DataGenerationService);
        fakeImageService = TestBed.inject(ImageService) as jasmine.SpyObj<ImageService>;
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
});
