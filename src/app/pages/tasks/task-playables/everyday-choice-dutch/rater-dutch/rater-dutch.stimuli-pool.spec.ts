import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { StimuliProvidedType } from 'src/app/models/enums';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { RatingTaskStimuliDutch } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import type { TaskPlayerState } from '../../task-player/task-player.component';
import { RaterDutchComponent, RaterTaskMetadata } from './rater-dutch.component';

describe('RaterDutchComponent stimuli pool shared across raters', () => {
    const allActivities: ITranslationText[] = Array.from({ length: 40 }, (_, i) => ({
        en: `activity-${i}`,
        nl: `activiteit-${i}`,
    }));

    // Deterministic stand-in for the random shuffle: every call rotates the activities
    // by another 10 positions, so two independent generations always overlap.
    function createDataGenServiceStub() {
        let generationCount = 0;
        return {
            generateRatingActivitiesDutch: () => allActivities,
            generateRatingStimuliDutch: (activities: ITranslationText[]): RatingTaskStimuliDutch[] => {
                const offset = (generationCount++ * 10) % activities.length;
                const rotated = [...activities.slice(offset), ...activities.slice(0, offset)];
                return rotated.map((activity) => ({ activity, type: 'social_activity', questions: [] }));
            },
        };
    }

    // Same cache contract as TaskPlayerState, shared by both raters.
    function createSharedState(): TaskPlayerState {
        const cache = new Map<string, unknown>();
        return {
            userID: 'user',
            studyID: 1,
            counterBalanceGroups: { 0: 'NA' },
            counterbalanceNumber: 0,
            setCacheValue: (key: string, value: unknown) => cache.set(key, value),
            getCacheValue: (key: string) => cache.get(key),
        } as unknown as TaskPlayerState;
    }

    function createConfiguredRater(state: TaskPlayerState): RaterDutchComponent {
        const rater = TestBed.createComponent(RaterDutchComponent).componentInstance;
        rater.configure(
            {
                componentName: 'RATINGCOMPONENTDUTCH',
                componentConfig: {
                    numTrials: 20,
                    stimuliConfig: { type: StimuliProvidedType.GENERATED, stimuli: null },
                },
            } as unknown as RaterTaskMetadata,
            state
        );
        jest.spyOn(rater, 'beginRound').mockResolvedValue(undefined);
        rater.start();
        return rater;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RaterDutchComponent],
            imports: [MaterialModule, HttpClientTestingModule],
            providers: [
                { provide: DataGenerationService, useValue: createDataGenServiceStub() },
                { provide: TranslateService, useValue: { currentLang: 'en' } },
                { provide: LoaderService, useValue: { showLoader: () => {}, hideLoader: () => {} } },
            ],
        }).compileComponents();
    });

    it('never shows the same activity in both raters', () => {
        const state = createSharedState();

        const firstRater = createConfiguredRater(state);
        const secondRater = createConfiguredRater(state);

        const shownActivities = [...firstRater.stimuli, ...secondRater.stimuli].map((s) => s.activity.en);
        expect(shownActivities.length).toBe(40);
        expect(new Set(shownActivities).size).toBe(40);
    });
});
