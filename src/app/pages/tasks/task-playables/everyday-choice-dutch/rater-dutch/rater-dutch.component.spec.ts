import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { RatingTaskStimuliDutch } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';

import { RaterDutchComponent, RatingTaskCounterBalanceDutch } from './rater-dutch.component';

@Component({
    selector: 'app-slider',
    template: '<p>mock slider</p>',
})
export class MockAppSlider {
    @Input() marks: any;
    @Input() shouldReverseLegend: any;
}

@Component({
    selector: 'app-option-display',
    template: '<p>mock option display</p>',
})
export class MockOptionDisplay {
    @Input() question: any;
    @Input() options: any;
}

describe('RaterDutchComponent', () => {
    let component: RaterDutchComponent;
    let fixture: ComponentFixture<RaterDutchComponent>;

    const followUpQuestion = {
        en: 'How much does this condition affect your ability to complete this activity?',
        nl: 'In welke mate beïnvloedt deze aandoening jouw vermogen om deze activiteit te voltooien?',
    };
    const followUpLegend = [
        { en: 'Very slightly / Not applicable', nl: 'Heel minimaal / Niet van toepassing' },
        { en: 'A lot (I cannot do it)', nl: 'Heel erg (Ik kan het niet doen)' },
    ];

    const multiPartStimulus: RatingTaskStimuliDutch = {
        activity: { en: 'Go for a walk', nl: 'Een wandeling maken' },
        type: 'social_activity',
        questions: [
            {
                isMultiPartQuestion: true,
                question: {
                    en: 'Do you have a condition that affects your ability to complete this activity?',
                    nl: 'Heb je een aandoening die jouw vermogen om deze activiteit te voltooien beïnvloedt?',
                },
                legend: [
                    { en: 'No', nl: 'Nee' },
                    { en: 'Yes', nl: 'Ja' },
                ],
                followUpQuestion,
                followUpLegend,
            },
            {
                isMultiPartQuestion: false,
                question: { en: 'How enjoyable is this activity?', nl: 'Hoe leuk is deze activiteit?' },
                legend: [
                    { en: 'Not at all', nl: 'Helemaal niet' },
                    { en: 'A lot', nl: 'Heel erg' },
                ],
            },
        ],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RaterDutchComponent, MockAppSlider, MockOptionDisplay],
            imports: [MaterialModule, HttpClientTestingModule],
            providers: [
                { provide: TranslateService, useValue: { currentLang: 'en' } },
                { provide: LoaderService, useValue: { showLoader: () => {}, hideLoader: () => {} } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RaterDutchComponent);
        component = fixture.componentInstance;
        spyOn(component, 'start');
        fixture.detectChanges();
    });

    afterEach(() => {
        component.isDestroyed = true;
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('multi-part follow-up question', () => {
        beforeEach(() => {
            component.stimuli = [JSON.parse(JSON.stringify(multiPartStimulus))];
            component.currentStimuliIndex = 0;
            component.currentQuestionIndex = 0;
            component['interTrialDelay'] = 0;
            component['interActivityDelay'] = 0;
            spyOn(component, 'beginRound').and.returnValue(Promise.resolve());
            component.taskData = [
                {
                    taskName: 'Rating Game',
                    trial: 1,
                    userID: 'user',
                    counterbalance: RatingTaskCounterBalanceDutch.NA,
                    isMultiPartQuestion: true,
                    activity: 'Go for a walk',
                    question: multiPartStimulus.questions[0].question.en,
                    userAnswer: null,
                    activityType: 'social_activity',
                    responseTime: 100,
                    submitted: '',
                    isPractice: false,
                    studyId: 1,
                    choiceTaskStimulusSet: '',
                },
            ];
        });

        it('inserts the follow-up as the next question when the user selects Yes', async () => {
            component.taskData[0].userAnswer = 'Yes';

            await component.decideToRepeat();

            expect(component.stimuli[0].questions.length).toBe(3);
            expect(component.stimuli[0].questions[1].question).toEqual(followUpQuestion);
            expect(component.stimuli[0].questions[1].legend).toEqual(followUpLegend);
            expect(component.stimuli[0].questions[1].isMultiPartQuestion).toBe(false);
            expect(component.currentQuestionIndex).toBe(1);
            expect(component.beginRound).toHaveBeenCalled();
        });

        it('does not insert a follow-up when the user selects No', async () => {
            component.taskData[0].userAnswer = 'No';

            await component.decideToRepeat();

            expect(component.stimuli[0].questions.length).toBe(2);
            expect(component.stimuli[0].questions[0].isMultiPartQuestion).toBe(true);
            expect(component.stimuli[0].questions[1].question.en).toBe('How enjoyable is this activity?');
            expect(component.currentQuestionIndex).toBe(1);
        });
    });
});
