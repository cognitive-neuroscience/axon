import { ComponentName } from "src/app/services/component-factory.service";
import { DemandSelectionCounterbalance } from "src/app/services/data-generation/stimuli-models";

export const DemandSelectionLayoutMetadata = {
    config: {
        counterBalanceGroups: {
            "1": DemandSelectionCounterbalance.SELECTEASYPATCH,
            "2": DemandSelectionCounterbalance.SELECTHARDPATCH,
        },
    },
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Part 2: Patch Game",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully",
                    },
                    {
                        sectionType: "text",
                        textContent: "Now you will be playing a slightly different game",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You will see two colored patches on the screen and will have to pick one. Each patch is hiding a colored number.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Once the number appears, as before, you will have to make a decision about that number based on its color: ORANGE or BLUE",
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
                title: "More instructions",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "There are differences between the patches:",
                    },
                    {
                        sectionType: "text",
                        textContent: "One patch is hiding numbers that change color less often",
                    },
                    {
                        sectionType: "text",
                        textContent: "The other patch is hiding numbers that change color more often",
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
                title: "More instructions",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "If you develop a preference for one of the patches, feel free to continue to choose it",
                    },
                    {
                        sectionType: "text",
                        textContent: "However, we recommend that <b>you try both patches at the beginning</b>",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Try to avoid choosing the patch solely based on how they look or on their location",
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
                title: "More instructions",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Steps to select a patch:",
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "1. Move the cursor to the bullseye in the middle of the screen. This will make the patches appear",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "2. To select a patch, move the cursor to its location. The number will then appear",
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />",
                    },
                    {
                        sectionType: "text",
                        textContent: "Then use the arrow keys as before to give us your answer",
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
                title: "More instructions",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "Remember, the color of the number tells you what you must identify abou that number",
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />",
                    },
                    {
                        sectionType: "text",
                        textContent: "Orange number:",
                    },
                    {
                        sectionType: "text",
                        textContent: "LESS than 5: Press the LEFT arrow key ⬅️",
                    },
                    {
                        sectionType: "text",
                        textContent: "GREATER than 5: Press the RIGHT arrow key ➡️",
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />",
                    },
                    {
                        sectionType: "text",
                        textContent: "Blue number:",
                    },
                    {
                        sectionType: "text",
                        textContent: "If number is ODD: Press the LEFT arrow key ⬅️",
                    },
                    {
                        sectionType: "text",
                        textContent: "If number is EVEN: Press the RIGHT arrow key ➡️",
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
                title: "First, a practice round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "(The game will launch in fullscreen)",
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
        // {
        //     component: ComponentName.NBACK_COMPONENT,
        //     config: {
        //         isPractice: true,
        //         maxResponseTime: 2000,
        //         interTrialDelay: 0,
        //         showFeedbackAfterEachTrial: true,
        //         showScoreAfterEachTrial: false,
        //         durationOfFeedback: 500,
        //         durationFixationPresented: 1000,
        //         numTrials: 15,
        //         stimuliConfig: {
        //             type: "generated",
        //             stimuli: null,
        //         },
        //     },
        // },
        // {
        //     component: ComponentName.DISPLAY_COMPONENT,
        //     content: {
        //         title: "Practice round is now complete",
        //         sections: [
        //             {
        //                 sectionType: "text",
        //                 textContent: "You will now play the actual game",
        //             },
        //             {
        //                 sectionType: "text",
        //                 textContent: "You will earn 10 points for every right answer",
        //             },
        //             {
        //                 sectionType: "text",
        //                 textContent: "Remember, press:",
        //             },
        //             {
        //                 sectionType: "text",
        //                 textContent: "⬅️ if the letter is <b>not the same</b> as 2 letters ago",
        //             },
        //             {
        //                 sectionType: "text",
        //                 textContent: "➡️ if the letter is <b>the same</b> as 2 letters ago",
        //             },
        //             {
        //                 sectionType: "text",
        //                 textContent: "Good luck!",
        //             },
        //             {
        //                 sectionType: "text",
        //                 textContent: 'Click "START" when you are ready for the actual game',
        //             },
        //         ],
        //         buttons: {
        //             isStart: true,
        //             previousDisabled: true,
        //             nextDisabled: false,
        //         },
        //     },
        // },
        // {
        //     component: ComponentName.NBACK_COMPONENT,
        //     config: {
        //         isPractice: false,
        //         maxResponseTime: 2000,
        //         interTrialDelay: 0,
        //         showFeedbackAfterEachTrial: false,
        //         showScoreAfterEachTrial: false,
        //         durationOfFeedback: 500,
        //         durationFixationPresented: 1000,
        //         numTrials: 70,
        //         stimuliConfig: {
        //             type: "generated",
        //             stimuli: null,
        //         },
        //     },
        // },
        // {
        //     component: ComponentName.DISPLAY_COMPONENT,
        //     content: {
        //         title: "Game has finished",
        //         sections: [
        //             {
        //                 sectionType: "text",
        //                 textContent: "Congratulations! You have finished the game successfully",
        //             },
        //             {
        //                 sectionType: "text",
        //                 injection: "cached-string",
        //                 cacheKeyForInjection: "nback-total-score",
        //                 textContent: "You scored ??? points",
        //             },
        //             {
        //                 sectionType: "text",
        //                 textContent: 'Thank you for your participation. Click "CONTINUE"',
        //             },
        //         ],
        //     },
        // },
    ],
};
