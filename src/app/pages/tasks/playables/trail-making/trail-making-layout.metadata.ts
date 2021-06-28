import { ComponentName } from "src/app/services/component-factory.service";

export const TrailMakingLayoutMetadata = {
    config: {},
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome to the Connect the dots game - Part 1",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully",
                    },
                    {
                        sectionType: "text",
                        textContent: "In this task, you will be shown numbered circles on the screen",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You must start by clicking the number 1, then 2, and then continue in ascending order as fast as possible",
                    },
                    {
                        sectionType: "text",
                        textContent: "Click NEXT to proceed",
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
                title: "Practice round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Let's practice",
                    },
                    {
                        sectionType: "text",
                        textContent: "The game will launch in full-screen",
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
            component: ComponentName.TRAIL_MAKING_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 240000,
                flashIncorrectDuration: 500,
                trialType: "NUMERIC",
                durationOutOfTimeMessageShown: 3000,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round is now complete!",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You will now play the actual game",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You must start by clicking the number 1, then 2, and then continue in ascending order as fast as possible",
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
            component: ComponentName.TRAIL_MAKING_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 240000,
                flashIncorrectDuration: 500,
                trialType: "NUMERIC",
                durationOutOfTimeMessageShown: 3000,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome to the Connect the dots game - part 2",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully",
                    },
                    {
                        sectionType: "text",
                        textContent: "In this task, you will be shown circles with numbers and letters on the screen",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Starting with number 1, you must click the circles ALTERNATING between numbers and letters in ascending order as fast as possible.",
                    },
                    {
                        sectionType: "text",
                        textContent: "See this example:",
                    },
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/trailmaking/connect-the-dots-2-example.png",
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
                title: "Practice round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Let's practice",
                    },
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/trailmaking/connect-the-dots-2-example.png",
                    },
                    {
                        sectionType: "text",
                        textContent: "The game will launch in full-screen",
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
            component: ComponentName.TRAIL_MAKING_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 240000,
                flashIncorrectDuration: 500,
                trialType: "ALPHANUMERIC",
                durationOutOfTimeMessageShown: 3000,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round is now complete!",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You will now play the actual game",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Starting with number 1, you must click the circles ALTERNATING between numbers and letters in ascending order as fast as possible",
                    },
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/trailmaking/connect-the-dots-2-example.png",
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
            component: ComponentName.TRAIL_MAKING_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 240000,
                flashIncorrectDuration: 500,
                trialType: "ALPHANUMERIC",
                durationOutOfTimeMessageShown: 3000,
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
                        textContent: 'Click "NEXT"',
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
