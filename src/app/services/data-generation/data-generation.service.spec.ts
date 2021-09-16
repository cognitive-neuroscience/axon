import { TestBed } from "@angular/core/testing";
import { ImageService } from "../image.service";
import { DataGenerationService } from "./data-generation.service";
import { SmileyFaceStimulus, SmileyFaceType, StroopStimulus } from "./stimuli-models";

describe("Data Generation Service", () => {
    let service: DataGenerationService;
    let fakeImageService: jasmine.SpyObj<ImageService>;
    beforeEach(() => {
        const spy = jasmine.createSpyObj("ImageService", ["loadImagesAsBlobs"]);

        TestBed.configureTestingModule({
            providers: [DataGenerationService, { provide: ImageService, useValue: spy }],
        });

        service = TestBed.inject(DataGenerationService);
        fakeImageService = TestBed.inject(ImageService) as jasmine.SpyObj<ImageService>;
    });

    it("should be instantiated", () => {
        expect(service).toBeTruthy();
    });

    describe("smiley face stimuli", () => {
        const numShortFaces = 50;
        const numShortFacesRewarded = 30;
        const numLongFaces = 50;
        const numLongFacesRewarded = 10;
        it("should generate the correct numbers of smiley face stimuli", () => {
            const smileyFaceStimuli = service.generateSmileyFaceStimuli(
                numShortFaces,
                numShortFacesRewarded,
                numLongFaces,
                numLongFacesRewarded
            );

            const numberShortFaces = smileyFaceStimuli.filter((x) => x.faceShown === SmileyFaceType.SHORT);
            const numberLongFaces = smileyFaceStimuli.filter((x) => x.faceShown === SmileyFaceType.LONG);
            const numberNoneFaces = smileyFaceStimuli.filter((x) => x.faceShown === SmileyFaceType.NONE);

            expect(numberShortFaces.length).toEqual(numShortFaces);
            expect(numberLongFaces.length).toEqual(numLongFaces);
            expect(numberNoneFaces.length).toEqual(0);
        });

        it("should generate the correct rewarded smiley face stimuli", () => {
            const smileyFaceStimuli = service.generateSmileyFaceStimuli(
                numShortFaces,
                numShortFacesRewarded,
                numLongFaces,
                numLongFacesRewarded
            );

            const shortFaceRewarded = smileyFaceStimuli.filter(
                (x) => x.faceShown === SmileyFaceType.SHORT && x.isRewarded === true
            );
            const longFaceRewarded = smileyFaceStimuli.filter(
                (x) => x.faceShown === SmileyFaceType.LONG && x.isRewarded === true
            );

            expect(shortFaceRewarded.length).toEqual(numShortFacesRewarded);
            expect(longFaceRewarded.length).toEqual(numLongFacesRewarded);
        });

        it("should default to false for all rescheduled rewards", () => {
            const smileyFaceStimuli = service.generateSmileyFaceStimuli(
                numShortFaces,
                numShortFacesRewarded,
                numLongFaces,
                numLongFacesRewarded
            );

            const reducerFunc = (acc: boolean, currVal: SmileyFaceStimulus) => {
                return acc && currVal.isRescheduledReward;
            };

            const shortSmileyFacesRescheduledReward = smileyFaceStimuli.reduce(reducerFunc, false);
            const longSmileyFacesRescheduledReward = smileyFaceStimuli.reduce(reducerFunc, false);

            expect(shortSmileyFacesRescheduledReward).toBeFalse();
            expect(longSmileyFacesRescheduledReward).toBeFalse();
        });

        it("should throw an error when the short faces rewarded are more than the short faces", () => {
            const func = () => {
                service.generateSmileyFaceStimuli(2, 1, 1, 2);
            };
            expect(func).toThrow(new Error("Num rewarded cannot be greater than the number of trials"));
        });

        it("should throw an error when the long faces rewarded are more than the long faces", () => {
            const func = () => {
                service.generateSmileyFaceStimuli(1, 2, 2, 1);
            };
            expect(func).toThrow(new Error("Num rewarded cannot be greater than the number of trials"));
        });
    });

    describe('stroop task stimuli', () => {
        it('should throw an error if number of congruent trials is greater than number of trials', () => {
            const func = () => {
                service.generateStroopStimuli(1, 2);
            }
            expect(func).toThrow(new Error("Number of congruent trials must be fewer than number of trials"));
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

            generatedStroopStimuli.forEach(element => {
                element.congruent ? 
                    expect(element.color).toEqual(element.word) :
                    expect(element.color).not.toEqual(element.word);
            });
        });
    });
});
