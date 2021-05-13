import { ComponentName } from "src/app/services/component-factory.service";

export const RatingLayoutMetadata = {
    config: {
        counterbalanced: true,
    },
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome to the Everyday Activities Game",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "We are trying to understand how people fill their days with activities.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "In this task we will ask you about activities that you may do in your everyday life.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "There are two parts to the task: <br> 1) Answering questions about different activities <br> 2) Indicating your preference between different activities",
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
                title: "COVID-19 Disclaimer",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "We recognize that what you currently do in your everyday life may be impacted by the COVID-19 pandemic.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "As a result, you may not currently be participating in some of the activities that we will ask you about.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "As much as possible, please try to picture yourself doing the activities under normal (pre-pandemic circumstances).",
                    },
                    {
                        sectionType: "text",
                        textContent: "Click NEXT to continue",
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
                title: "Everyday Activities Game - Part 1",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Please read the following instructions carefully.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "We will ask you a series of questions about how you feel about different activities.",
                    },
                    {
                        sectionType: "text",
                        textContent: "You will have to provide your response using your mouse.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Click NEXT to continue",
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
                title: "Let’s walk through an example",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Activity: Bring the car to the mechanic",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You will be asked: How much you look forward to the outcome of it? How mentally effortful does this activity feel to you? ",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "We understand that this may or may not apply to you (perhaps you don’t currently own a car), but we ask that you try to picture yourself doing each activity so that you can answer the questions.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Click START to practice",
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
            component: ComponentName.RATING_COMPONMENT,
            config: {
                isPractice: true,
                maxResponseTime: 30000,
                interTrialDelay: 1000,
                delayToShowHelpMessage: 20000,
                durationHelpMessageShown: 10000,
                durationOutOftimeMessageShown: 4000,
                delayToShowRatingSlider: 1500,
                stimuliConfig: {
                    type: "hardcoded",
                    stimuli: [
                        {
                            activity: "Bring the car to the mechanic",
                            type: "DoSomething",
                            questions: [
                                {
                                    question: "How much do you look forward to the outcome of this activity?",
                                    legend: ["Not at all", "Very Much"],
                                },
                                {
                                    question: "How mentally effortful does this activity feel to you?",
                                    legend: ["Not at all", "Very effortful"],
                                },
                            ],
                        },
                    ],
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
                        textContent: "Now you are ready to start.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "We will show you a total of 26 activities and ask you a series of questions about each activity.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "Please take a moment to picture yourself doing each activity before answering the questions.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Click START when you are ready",
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
            component: ComponentName.RATING_COMPONMENT,
            config: {
                isPractice: false,
                maxResponseTime: 30000,
                interTrialDelay: 1000,
                delayToShowHelpMessage: 20000,
                durationHelpMessageShown: 10000,
                durationOutOftimeMessageShown: 4000,
                delayToShowRatingSlider: 1500,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
    ],
};
