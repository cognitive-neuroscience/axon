import { ComponentName } from "src/app/services/component-factory.service";

export const NBackLayoutMetadata = {
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
                title: "Welcome to the N-Back Task",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "In this task, you will be presented with letters. One letter at a time will be presented on screen",
                    },
                    {
                        sectionType: "text",
                        textContent: "This is a memory task:",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "For each letter, you have to decide if it is the same letter that was presented 2 letters ago.",
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
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You have to press:",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "⬅️ (Left arrow) for <b>not the same</b>, if the letter is <b>not the same</b> as the one that was presented 2 letters ago",
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "➡️ (Right arrow) for <b>the same</b> if the letter is <b>the same</b> as the one that was presented 2 letters ago",
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
                title: "Here is an example",
                sections: [
                    {
                        sectionType: "image-horizontal",
                        imageAlignment: "center",
                        imagePath: "/assets/images/instructions/nback/examplePart1.png",
                    },
                    {
                        sectionType: "text",
                        textContent: "You press ➡️ because there was another K two letters ago, i.e. SAME letter",
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
                title: "Here is an example",
                sections: [
                    {
                        sectionType: "image-horizontal",
                        imageAlignment: "center",
                        imagePath: "/assets/images/instructions/nback/examplePart2.png",
                    },
                    {
                        sectionType: "text",
                        textContent: "You press ⬅️ for all other letters",
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
                title: "Here is an example",
                sections: [
                    {
                        sectionType: "image-horizontal",
                        imageAlignment: "center",
                        imagePath: "/assets/images/instructions/nback/examplePart3.png",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Note that for the first two letters of the task, there is no letter to compare to, so you just press ⬅️ for these",
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
                        textContent: "Let's practice. You will have very little time to respond, so be ready!",
                    },
                    {
                        sectionType: "text",
                        textContent: "(the game will launch in fullscreen)",
                    },
                    {
                        sectionType: "text",
                        textContent: "Remember, press:",
                    },
                    {
                        sectionType: "text",
                        textContent: "⬅️ if the letter is <b>not the same</b> as 2 letters ago",
                    },
                    {
                        sectionType: "text",
                        textContent: "➡️ if the letter is <b>the same</b> as 2 letters ago",
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
            component: ComponentName.NBACK_COMPONENT,
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
                        textContent: "You will earn 10 points for every right answer",
                    },
                    {
                        sectionType: "text",
                        textContent: "Remember, press:",
                    },
                    {
                        sectionType: "text",
                        textContent: "⬅️ if the letter is <b>not the same</b> as 2 letters ago",
                    },
                    {
                        sectionType: "text",
                        textContent: "➡️ if the letter is <b>the same</b> as 2 letters ago",
                    },
                    {
                        sectionType: "text",
                        textContent: "Good luck!",
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
            component: ComponentName.NBACK_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 2000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: false,
                showScoreAfterEachTrial: false,
                durationOfFeedback: 500,
                durationFixationPresented: 1000,
                numTrials: 70,
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
                        textContent: "Congratulations! You have finished the game successfully",
                    },
                    {
                        sectionType: "text",
                        injection: "cached-string",
                        cacheKey: "nback-total-score",
                        textContent: "You scored ??? points",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Thank you for your participation. Click "CONTINUE"',
                    },
                ],
            },
        },
    ],
};
