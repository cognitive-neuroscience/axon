import { ComponentName } from "src/app/services/component-factory.service";
import { OddballTaskCounterbalance } from "./oddball.component";

export const OddballLayoutMetadata = {
    config: {
        counterBalanceGroups: {
            1: OddballTaskCounterbalance.M,
            2: OddballTaskCounterbalance.Z,
        },
    },
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome to the Oddball Task",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully",
                    },
                    {
                        sectionType: "text",
                        textContent: 'In this game, you will see "+" in the middle of the screen.',
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'The "+" will be replaced by different shapes, which will be presented only briefly.',
                    },
                    {
                        sectionType: "text",
                        textContent: "Your goal is to identify when the triangle appears.",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Press <b>???</b> on the keyboard when you see the TRIANGLE.",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Press <b>???</b> on the keyboard for any other shape.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Click NEXT to continue",
                    },
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: true,
                    nextDisabled: false,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "You will start with a warm-up block and then a practice block where feedback will be provided after each trial.",
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>Remember:</b>",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Press <b>???</b> on the keyboard when you see the TRIANGLE",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Press <b>???</b> on the keyboard for any other shape",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" to begin the warm-up block',
                    },
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            },
        },
        {
            component: ComponentName.ODDBALL_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 2000,
                interTrialDelay: 200,
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 500,
                durationStimulusPresented: 450,
                durationFixationJitteredLowerBound: 1000,
                durationFixationJitteredUpperBound: 2000,
                numTrials: 10,
                numTargetTrials: 2,
                numNovelStimuli: 0,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "You have completed the warm-up block! Next is a practice block where feedback will be provided.",
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>Remember:</b>",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Press <b>???</b> on the keyboard when you see the TRIANGLE",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Press <b>???</b> on the keyboard for any other shape",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready to begin the practice',
                    },
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: true,
                    nextDisabled: false,
                },
            },
        },
        {
            component: ComponentName.ODDBALL_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 2000,
                interTrialDelay: 200,
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 500,
                durationStimulusPresented: 450,
                durationFixationJitteredLowerBound: 1000,
                durationFixationJitteredUpperBound: 2000,
                numTrials: 10,
                numTargetTrials: 2,
                numNovelStimuli: 0,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "You have reached the end of the practice block! Feedback will no longer be provided. There will be a total of 4 blocks with breaks between each block.",
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>Remember:</b>",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Press <b>???</b> on the keyboard when you see the TRIANGLE",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Press <b>???</b> on the keyboard for any other shape",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready to begin',
                    },
                ],
            },
        },
        {
            component: ComponentName.ODDBALL_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 2000,
                interTrialDelay: 200,
                showFeedbackAfterEachTrial: false,
                durationOfFeedback: 500,
                durationStimulusPresented: 450,
                durationFixationJitteredLowerBound: 1000,
                durationFixationJitteredUpperBound: 2000,
                numTrials: 60,
                numTargetTrials: 12,
                numNovelStimuli: 0,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "You've reached the end of the block!",
                timerConfig: {
                    timer: 30000,
                    showTimer: true,
                    canSkipTimer: true,
                },
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You may take a 30 second break",
                    },
                    {
                        sectionType: "text",
                        textContent: "Remember:",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Press ??? on the keyboard when you see a triangle",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Press ??? on the keyboard for any other shape",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'You will be automatically directed to the next block after the break. A "Get Ready!" slide will appear before you begin. You can also click "NEXT" to move on to the next round',
                    },
                ],
            },
        },
        {
            component: ComponentName.ODDBALL_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 2000,
                interTrialDelay: 200,
                showFeedbackAfterEachTrial: false,
                durationOfFeedback: 500,
                durationStimulusPresented: 450,
                durationFixationJitteredLowerBound: 1000,
                durationFixationJitteredUpperBound: 2000,
                numTrials: 60,
                numTargetTrials: 12,
                numNovelStimuli: 0,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "You've reached the end of the block!",
                timerConfig: {
                    timer: 30000,
                    showTimer: true,
                    canSkipTimer: true,
                },
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You may take a 30 second break",
                    },
                    {
                        sectionType: "text",
                        textContent: "Remember:",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Press ??? on the keyboard when you see a triangle",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Press ??? on the keyboard for any other shape",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'You will be automatically directed to the next block after the break. A "Get Ready!" slide will appear before you begin. You can also click "NEXT" to move on to the next round',
                    },
                ],
            },
        },
        {
            component: ComponentName.ODDBALL_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 2000,
                interTrialDelay: 200,
                showFeedbackAfterEachTrial: false,
                durationOfFeedback: 500,
                durationStimulusPresented: 450,
                durationFixationJitteredLowerBound: 1000,
                durationFixationJitteredUpperBound: 2000,
                numTrials: 60,
                numTargetTrials: 6,
                numNovelStimuli: 6,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "You've reached the end of the block!",
                timerConfig: {
                    timer: 30000,
                    showTimer: true,
                    canSkipTimer: true,
                },
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You may take a 30 second break",
                    },
                    {
                        sectionType: "text",
                        textContent: "Remember:",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Press ??? on the keyboard when you see a triangle",
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Press ??? on the keyboard for any other shape",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'You will be automatically directed to the next block after the break. A "Get Ready!" slide will appear before you begin. You can also click "NEXT" to move on to the next round',
                    },
                ],
            },
        },
        {
            component: ComponentName.ODDBALL_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 2000,
                interTrialDelay: 200,
                showFeedbackAfterEachTrial: false,
                durationOfFeedback: 500,
                durationStimulusPresented: 450,
                durationFixationJitteredLowerBound: 1000,
                durationFixationJitteredUpperBound: 2000,
                numTrials: 60,
                numTargetTrials: 6,
                numNovelStimuli: 6,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Game has finished",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Thank you for your participation!",
                    },
                ],
            },
        },
    ],
};
