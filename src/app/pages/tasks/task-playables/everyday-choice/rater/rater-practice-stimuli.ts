import { RatingTaskStimuli } from 'src/app/services/data-generation/stimuli-models';

export const RATER_PRACTICE_LONG_VERSION_STIMULI: RatingTaskStimuli[] = [
    {
        activity: {
            en: 'Bring the car to the mechanic',
            fr: 'Amener la voiture chez le garagiste',
        },
        type: 'DoSomething',
        questions: [
            {
                question: {
                    en: 'How much do you look forward to the outcome of it?',
                    fr: 'À quel point avez-vous hâte au résultat de cette activité ?',
                },
                legend: [
                    {
                        en: 'Not at all',
                        fr: 'Pas du tout',
                    },
                    {
                        en: 'Very much',
                        fr: 'Beaucoup',
                    },
                ],
            },
            {
                question: {
                    en: 'How mentally effortful does this activity feel to you?',
                    fr: 'À quel point cette activité vous demande-t-elle un effort mental ?',
                },
                legend: [
                    {
                        en: 'Not at all',
                        fr: 'Pas du tout',
                    },
                    {
                        en: 'Very much',
                        fr: 'Beaucoup',
                    },
                ],
            },
        ],
    },
];

export const RATER_PRACTICE_SHORT_VERSION_STIMULI: RatingTaskStimuli[] = [
    {
        activity: {
            en: 'Bring the car to the mechanic',
            fr: 'Amener la voiture chez le garagiste',
        },
        type: 'DoSomething',
        questions: [
            {
                question: {
                    en: 'How effortful is this activity for you?',
                    fr: "À quel point cette activité vous demande-t-elle de l'effort?",
                },
                legend: [
                    {
                        en: 'Not at all',
                        fr: 'Pas du tout',
                    },
                    {
                        en: 'Very much',
                        fr: 'Beaucoup',
                    },
                ],
            },
            {
                question: {
                    en: 'How enjoyable is this activity for you?',
                    fr: 'À quel point cette activité vous plaît-elle ?',
                },
                legend: [
                    {
                        en: 'Not at all',
                        fr: 'Pas du tout',
                    },
                    {
                        en: 'Very much',
                        fr: 'Beaucoup',
                    },
                ],
            },
        ],
    },
];
