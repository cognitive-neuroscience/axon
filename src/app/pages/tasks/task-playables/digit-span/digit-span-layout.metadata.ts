import { ComponentName } from "src/app/services/component-factory.service";

export const DigitSpanLayoutMetadata = {
    config: {},
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome to the Digit Span Task",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully",
                    },
                    {
                        sectionType: "text",
                        textContent: "This is a memory text",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You will see a sequence of numbers appear on the screen <b>one at a time</b>. For instance, the numers <b>3, 9, 2</b> will appear one at a time",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'Then, using the keypad shown on the screen, you will need to enter those same numbers <b>in the same order (i.e. 3, 9, 2)</b> and click the "Submit" key',
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed',
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
                title: "Practice round pt. 1",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Let's practice",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Remember when the keypad is shown, you need to enter the numbers <b>in the same order</b> as they were shown and click submit.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'The game will launch in full-screen. Click "START" when you are ready for the practice round.',
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
            component: ComponentName.DIGIT_SPAN_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 30000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: true,
                durationDigitPresented: 1000,
                durationPauseBetweenDigits: 300,
                durationOfFeedback: 1000,
                delayToShowHelpMessage: 20000,
                durationHelpMessageShown: 3000,
                durationFixationPresented: 500,
                useForwardSequence: true,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Good job!",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You will now play the actual game.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Remember when the keypad is shown, you need to enter the numbers <b>in the same order</b> as they were shown and click submit.",
                    },
                    {
                        sectionType: "text",
                        textContent: "If you don't remember the numbers, click skip or just wait until the next trial.",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready for the actual game',
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
            component: ComponentName.DIGIT_SPAN_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 30000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: false,
                durationDigitPresented: 1000,
                durationPauseBetweenDigits: 300,
                durationOfFeedback: 1000,
                delayToShowHelpMessage: 20000,
                durationHelpMessageShown: 3000,
                durationFixationPresented: 500,
                useForwardSequence: true,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round pt. 2",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully",
                    },
                    {
                        sectionType: "text",
                        textContent: "Good job!",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You will see a sequence of numbers appear on the screen <b>one at a time</b>. For instance, the number <b>3, 9, 2<b/> will appear one at a time.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Then, using the keypad shown on the screen, you will need to enter those same numbers <b>in the reverse order (2, 9, 3)<b/> and click the 'Submit' key",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed',
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
                title: "Practice round pt. 2",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Let's practice",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Rememebr when the keypad is shown, you need to neter the numbers <b>in the reverse order</b> that they were shown in and click submit",
                    },
                    {
                        sectionType: "text",
                        textContent: "The game will launch in full-screen.",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready for the practice round',
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
            component: ComponentName.DIGIT_SPAN_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 30000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: true,
                durationDigitPresented: 1000,
                durationPauseBetweenDigits: 300,
                durationOfFeedback: 1000,
                delayToShowHelpMessage: 20000,
                durationHelpMessageShown: 3000,
                durationFixationPresented: 1000,
                useForwardSequence: false,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Good job!",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You will now play the actual game",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Remember when the keypad is shown, you need to enter the numbers <b>in the reverse order</b> as they were shown and click the <b>submit</b> button",
                    },
                    {
                        sectionType: "text",
                        textContent: "If you don't remember the numbers, click skip or just wait until the next trial.",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready for the actual game',
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
            component: ComponentName.DIGIT_SPAN_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 30000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: false,
                durationDigitPresented: 1000,
                durationPauseBetweenDigits: 300,
                durationOfFeedback: 1000,
                delayToShowHelpMessage: 20000,
                durationHelpMessageShown: 3000,
                durationFixationPresented: 1000,
                useForwardSequence: false,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "The game has finished",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Congratulations!",
                    },
                    {
                        sectionType: "text",
                        textContent: "You finished the game successfully",
                    },
                    {
                        sectionType: "text",
                        textContent: "Thank you for your participation",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to continue',
                    },
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: true,
                    nextDisabled: false,
                },
            },
        },
    ],
};
