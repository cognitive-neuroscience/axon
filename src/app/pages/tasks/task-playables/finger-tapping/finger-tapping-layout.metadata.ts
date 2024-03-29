import { ComponentName } from "src/app/services/component-factory.service";

export const FingerTappingLayoutMetadata = {
    config: {},
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome to the Finger Tapping Task",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Read the instructions carefully",
                    },
                    {
                        sectionType: "text",
                        textContent: "This is a test of finger tapping speed",
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
            component: ComponentName.SELECT_OPTION_COMPONENT,
            content: {
                question: "Are you left handed or right handed?",
                cacheKey: "finger-tapping-handedness",
                options: [
                    {
                        label: "Left Handed",
                        value: "LEFT",
                    },
                    {
                        label: "Right Handed",
                        value: "RIGHT",
                    },
                ],
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Using your index finger:",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You will have to <b>alternatively</b> tap the <b>P</b> and <b>Q</b> keys of the keyboard <b>as fast as you can</b>",
                    },
                    {
                        sectionType: "text",
                        textContent: "You will do 3 rounds of this.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Just before you start, we will tell you which hand to use",
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
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "The keys you will be tapping on the keyboard",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Are the "Q" and the "P" keys',
                    },
                    {
                        sectionType: "text",
                        textContent: "Please go ahead and find these keys now",
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
                title: "Practice round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "First, let's practice",
                    },
                    {
                        sectionType: "text",
                        textContent: "For the practice, please use your <b>RIGHT</b> hand",
                    },
                    {
                        sectionType: "text",
                        textContent: "(the task will launch in fullscreen)",
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
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "You must use ONLY the INDEX finger of a SINGLE hand",
                timerConfig: {
                    timer: 5000,
                    showTimer: true,
                    canSkipTimer: false,
                    countDown: true,
                },
                sections: [],
            },
        },
        {
            component: ComponentName.FINGER_TAPPING_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 1000000,
                durationFixationPresented: 50,
                useHand: "RIGHT",
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Main round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Good job! Now you will complete the main test.",
                    },
                    {
                        sectionType: "text",
                        textContent: "You will be doing 3 rounds",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "In the first two rounds, you have to keep tapping as <b>fast as you can</b> with a SINGLE index finger for 1 full minute",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "In the third round, you haev to keep tapping <b>as fast as you can</b> with BOTH index fingers for 20 seconds",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "You'll get a break between each round and we will tell you which hand to use before you begin",
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
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "1st Round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Please use your <b>DOMINANT HAND</b> for this round",
                    },
                    {
                        sectionType: "text",
                        textContent: "(if you're right-handed, that is your right hand)",
                    },
                    {
                        sectionType: "text",
                        textContent: "REMEMBER:",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            'Tap the "P" and "Q" keys as fast as you can with your <b>DOMINANT HAND INDEX FINGER</b>',
                    },
                    {
                        sectionType: "text",
                        textContent: "The game will launch in fullscreen",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready',
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
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "You must use ONLY the INDEX finger of a SINGLE hand",
                timerConfig: {
                    timer: 5000,
                    showTimer: true,
                    canSkipTimer: false,
                    countDown: true,
                },
                sections: [],
            },
        },
        {
            component: ComponentName.FINGER_TAPPING_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 60000,
                durationFixationPresented: 50,
                useHand: "DOMINANT",
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Round 2",
                timerConfig: {
                    timer: 120000,
                    showTimer: true,
                    canSkipTimer: true,
                    skipAvailableAfterXSeconds: 30,
                    countDown: false,
                },
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Please use your <b>NON DOMINANT</b> hand for this round.",
                    },
                    {
                        sectionType: "text",
                        textContent: "(so if you are right-handed, that is your left hand)",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Remember: Tap the "P" and the "Q" keys as fast as you can',
                    },
                    {
                        sectionType: "text",
                        textContent: "You have to wait at least <b>30 seconds</b> before being able to continue",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "The next round will automatically start in 2 minutes unless you choose to continue sooner",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready',
                    },
                ],
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "You must use ONLY the INDEX finger of a SINGLE hand",
                timerConfig: {
                    timer: 5000,
                    showTimer: true,
                    canSkipTimer: true,
                    skipAvailableAfterXSeconds: 0,
                    countDown: true,
                },
                sections: [],
            },
        },
        {
            component: ComponentName.FINGER_TAPPING_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 60000,
                durationFixationPresented: 50,
                useHand: "NONDOMINANT",
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Round 3",
                timerConfig: {
                    timer: 120000,
                    showTimer: true,
                    canSkipTimer: true,
                    skipAvailableAfterXSeconds: 30,
                    countDown: false,
                },
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Please use your <b>BOTH INDEX FINGERS</b> hand for this round.",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "This means you must use your LEFT finger to tap 'Q' and your RIGHT finger to tap 'P'",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "And remember, as before, your goal is to alternate between tapping the 'P' and the 'Q' keys as fast as you can!",
                    },
                    {
                        sectionType: "text",
                        textContent: "You have to wait at least <b>30 seconds</b> before being able to continue",
                    },
                    {
                        sectionType: "text",
                        textContent:
                            "The next round will automatically start in 2 minutes unless you choose to continue sooner",
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready',
                    },
                ],
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "You must use ONLY the INDEX finger of a SINGLE hand",
                timerConfig: {
                    timer: 5000,
                    showTimer: true,
                    canSkipTimer: true,
                    skipAvailableAfterXSeconds: 0,
                    countDown: true,
                },
                sections: [],
            },
        },
        {
            component: ComponentName.FINGER_TAPPING_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 20000,
                durationFixationPresented: 50,
                useHand: "BOTH",
            },
        },
    ],
};
