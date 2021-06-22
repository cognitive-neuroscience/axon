import { ComponentName } from "src/app/services/component-factory.service";
import { SmileyFaceTaskCounterbalance } from "./smiley-face.component";

export const SmileyFaceLayoutMetadata = {
    config: {
        counterBalanceGroups: {
            "1": SmileyFaceTaskCounterbalance.SHORT_FACE_REWARDED_MORE,
            "2": SmileyFaceTaskCounterbalance.LONG_FACE_REWARDED_MORE,
        },
    },
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome to the Smiley Face Game",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You will be shown a smiley face.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Your job is to determine if the face has a <b>short</b> or a <b>long</b> mouth.",
                    },
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/smileyface/countdown.png",
                    },
                    {
                        sectionType: "text",
                        textContent: "Watch carefully becuase the smile will only appear very briefly",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to practice',
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
                title: "Practice Round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Let's practice.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Put your index fingers in position.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You will not have much time - the smiley faces will flash on the screen very quickly!",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'You must press "Z" if it is a <b>short</b> mouth, or "M" if it is a <b>long</b> mouth',
                    },
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/smileyface/countdown.png",
                    },
                    {
                        sectionType: "text",
                        textContent: "The game will launch in full-screen",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready to start the practice round',
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
            component: ComponentName.SMILEY_FACE_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 3000,
                interTrialDelay: 0,
                durationFeedbackPresented: 1000,
                durationFixationPresented: 500,
                durationNoFacePresented: 500,
                durationStimulusPresented: 100,
                numShortFaces: 5,
                numFacesMoreRewarded: 5,
                numLongFaces: 5,
                numFacesLessRewarded: 5,
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
                        textContent: "Now you are ready for the real game.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You will get <b>50 points</b> for correct answers <b>but only some of your correct answers will be rewarded</b> with points.",
                    },
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/smileyface/countdown.png",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready to start the game.',
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
            component: ComponentName.SMILEY_FACE_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 3000,
                interTrialDelay: 0,
                durationFeedbackPresented: 1000,
                durationFixationPresented: 500,
                durationStimulusPresented: 100,
                durationNoFacePresented: 500,
                numShortFaces: 2,
                numFacesMoreRewarded: 1,
                numLongFaces: 2,
                numFacesLessRewarded: 1,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Please take a break. We ask that you keep it under <b>2 minutes</b>.",
                sections: [
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/smileyface/countdown.png",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Press "START" when you are ready to continue',
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
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Get ready!",
                timerConfig: {
                    timer: 10000,
                    showTimer: true,
                    canSkipTimer: false,
                    countDown: true,
                },
                sections: [
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/smileyface/countdown.png",
                    },
                ],
            },
        },
        {
            component: ComponentName.SMILEY_FACE_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 3000,
                interTrialDelay: 0,
                durationFeedbackPresented: 1000,
                durationFixationPresented: 500,
                durationStimulusPresented: 100,
                durationNoFacePresented: 500,
                numShortFaces: 2,
                numFacesMoreRewarded: 1,
                numLongFaces: 2,
                numFacesLessRewarded: 1,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Please take a break. We ask that you keep it under <b>2 minutes</b>.",
                sections: [
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/smileyface/countdown.png",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Press "START" when you are ready to continue',
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
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Get ready!",
                timerConfig: {
                    timer: 10000,
                    showTimer: true,
                    canSkipTimer: false,
                    countDown: true,
                },
                sections: [
                    {
                        sectionType: "image-horizontal",
                        imageAlignment: "center",
                        imagePath: "/assets/images/instructions/smileyface/countdown.png",
                    },
                ],
            },
        },
        {
            component: ComponentName.SMILEY_FACE_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 3000,
                interTrialDelay: 0,
                durationFeedbackPresented: 1000,
                durationFixationPresented: 500,
                durationStimulusPresented: 100,
                durationNoFacePresented: 500,
                numShortFaces: 2,
                numFacesMoreRewarded: 1,
                numLongFaces: 2,
                numFacesLessRewarded: 1,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Congratulations!",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "You finished the game successfully",
                    },
                    {
                        sectionType: "text",
                        injection: "cached-string",
                        cacheKeyForInjection: "smiley-face-total-score",
                        textContent: "You won ??? points",
                    },
                    {
                        sectionType: "image-horizontal",
                        imagePath: "/assets/images/instructions/smileyface/countdown.png",
                    },
                    {
                        sectionType: "text",
                        textContent: "Thank you for your participation.",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to continue',
                    },
                ],
            },
        },
    ],
};
