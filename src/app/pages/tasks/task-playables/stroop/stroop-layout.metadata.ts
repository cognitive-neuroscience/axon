import { ComponentName } from "src/app/services/component-factory.service";

export const StroopLayoutMetadata = {
    config: {
        counterBalanceGroups: {
            "1": 1,
            "2": 2,
            "3": 3,
            "4": 4,
        },
    },
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome to the Stroop Task",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'In this task, you will be presented with different words for colors (e.g. "blue") printed in different colored ink:',
                    },
                    {
                        sectionType: "image-square",
                        imagePath: "/assets/images/instructions/strooptask/stroop_ink_examples.png",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "It's your goal to respond to the <b>color</b> of the ink that the word is printed in, not the word itself.",
                    },
                    {
                        sectionType: "image-square",
                        imagePath: "/assets/images/instructions/strooptask/stroop_ink_instructions.png",
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
                title: "Here are some examples",
                sections: [
                    {
                        sectionType: "text",
                        textContent: 'If you see "blue" with red ink then you should respond "1"',
                    },
                    {
                        sectionType: "text",
                        textContent: 'If you see "blue" with blue ink then you should respond "2"',
                    },
                    {
                        sectionType: "text",
                        textContent: 'If you see "blue" with green ink then you should respond "3"',
                    },
                    {
                        sectionType: "text",
                        textContent: "Only the color of the ink matters, not the word itself.",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Please use the number keys "1", "2", "3" on your keyboard to respond',
                    },
                    {
                        sectionType: "image-square",
                        imagePath: "/assets/images/instructions/strooptask/stroop_ink_instructions.png",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed',
                    },
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice Round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Let's practice",
                    },
                    {
                        sectionType: "text",
                        textContent: "Good luck! You will have very little time to respond, so be ready",
                    },
                    {
                        sectionType: "image-square",
                        imagePath: "/assets/images/instructions/strooptask/stroop_ink_instructions.png",
                    },
                    {
                        sectionType: "text",
                        textContent: "The game will launch in fullscreen",
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
            component: ComponentName.STROOP_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 2000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: true,
                showScoreAfterEachTrial: false,
                durationOfFeedback: 500,
                durationFixationPresented: 1000,
                numTrials: 15,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round is now complete",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You will now play the actual game",
                    },
                    {
                        sectionType: "text",
                        textContent: "You will earn 10 points for every correct answer",
                    },
                    {
                        sectionType: "text",
                        textContent: "Good luck!",
                    },
                    {
                        sectionType: "image-square",
                        imagePath: "/assets/images/instructions/strooptask/stroop_ink_instructions.png",
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
            component: ComponentName.STROOP_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 2000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: false,
                showScoreAfterEachTrial: false,
                durationOfFeedback: 500,
                durationFixationPresented: 1000,
                numTrials: 120,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Congratulations! You have finished the game successfully",
                sections: [
                    {
                        sectionType: "text",
                        injection: "cached-string",
                        cacheKey: "total-score",
                        textContent: "You scored: ??? points",
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
