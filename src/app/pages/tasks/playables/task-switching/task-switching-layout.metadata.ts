import { Color } from "src/app/models/InternalDTOs";
import { ComponentName } from "src/app/services/component-factory.service";

export const TaskSwitchingLayoutMetadata = {
    config: {},
    metadata: [
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Welcome",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "There are two parts to this game. Part 1 is the number game",
                    },
                    {
                        sectionType: "text",
                        textContent: "Thank you for participating. First, we will go through the instructions and then you will have some opportunity to practice.",
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
                        textContent: "Read the instructions carefully.",
                    },
                    {
                        sectionType: "text",
                        textContent: "You will see a number on the screen. That number will either be <b>ORANGE</b> or <b>BLUE</b>",
                    },
                    {
                        sectionType: "text",
                        textContent: "The color is important: It will tell you what you must identify about that number."
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
                title: "Instructions continued",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "<b>ORANGE NUMBER</b>",
                    },
                    {
                        sectionType: "text",
                        textContent: "Determine if the number is less than or greater than 5",
                    },
                    {
                        sectionType: "text",
                        textContent: "Lesser than 5: Press the left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Greater than 5: Press the right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>BLUE NUMBER</b>",
                    },
                    {
                        sectionType: "text",
                        textContent: "Determine if the number is odd or even",
                    },
                    {
                        sectionType: "text",
                        textContent: "If the number is odd: Press the left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "If the number is even: Press the right arrow key ➡️"
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
                title: "Examples",
                sections: [
                    {
                        sectionType: "image-small",
                        imageAlignment: "left",
                        imagePath: '/assets/images/instructions/taskswitching/orange3.png',
                    },
                    {
                        sectionType: "text",
                        textContent: "Hint: The number is <b>ORANGE</b> so you must decide if it is less than or greater than 5"
                    },
                    {
                        sectionType: "text",
                        textContent: "You should choose <b>LEFT</b> arrow to indicate that it's less than (<) 5"
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />"
                    },
                    {
                        sectionType: "image-small",
                        imageAlignment: "left",
                        imagePath: '/assets/images/instructions/taskswitching/blue8.png',
                    },
                    {
                        sectionType: "text",
                        textContent: "Hint: The number is <b>BLUE</b> so you must decide if it is an odd or even number"
                    },
                    {
                        sectionType: "text",
                        textContent: "You should choose <b>RIGHT</b> arrow to indicate that it's even"
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
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Examples",
                sections: [
                    {
                        sectionType: "image-small",
                        imageAlignment: "left",
                        imagePath: '/assets/images/instructions/taskswitching/orange7.png',
                    },
                    {
                        sectionType: "text",
                        textContent: "Hint: The number is <b>ORANGE</b> so you must decide if it is less than or greater than 5"
                    },
                    {
                        sectionType: "text",
                        textContent: "You should choose the <b>RIGHT</b> arrow to indicate that it's greater than (>) 5"
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />"
                    },
                    {
                        sectionType: "image-small",
                        imageAlignment: "left",
                        imagePath: '/assets/images/instructions/taskswitching/blue7.png',
                    },
                    {
                        sectionType: "text",
                        textContent: "Hint: The number is <b>BLUE</b> so you must decide if it is an odd or even number"
                    },
                    {
                        sectionType: "text",
                        textContent: "You should choose the <b>LEFT</b> arrow to indicate that it's odd"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed',
                    }
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Let's practice"
                    },
                    {
                        sectionType: "text",
                        textContent: "Don't worry, this is just to help you learn which keys to press. We will continue to give you hints."
                    },
                    {
                        sectionType: "text",
                        textContent: "The game will launch in fullscreen"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed'
                    }
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "<b>BLUE NUMBER</b>: is number odd or even?"
                    },
                    {
                        sectionType: "text",
                        textContent: "Odd: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Even: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: "<br />"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>ORANGE NUMBER</b>: is number odd or even?"
                    },
                    {
                        sectionType: "text",
                        textContent: "Less than 5: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Greater than 5: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" to start the practice'
                    }
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.TASK_SWITCHING_COMPONENT,
            config: {
                isPractice: true,
                showHint: true,
                maxResponseTime: 10000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: true,
                durationFixationPresented: 500,
                durationOfFeedback: 1000,
                numTrials: 5,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                probOfShift: 50,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "1st Practice round is now complete",
                sections: [
                    {
                        sectionType: "text",
                        injection: "cached-string",
                        cacheKey: "task-switching-num-correct",
                        textContent: "You got ??? out of 5 trials correct"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" when you are ready for the next stage'
                    }
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: true,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round 2",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Remember, the number's color tells you what you must identify about the number"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>ORANGE NUMBER</b>"
                    },
                    {
                        sectionType: "text",
                        textContent: "Less than 5: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Greater than 5: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>BLUE NUMBER</b>"
                    },
                    {
                        sectionType: "text",
                        textContent: "Odd: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Even: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready for the practice round'
                    }
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.TASK_SWITCHING_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 4000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: true,
                durationFixationPresented: 500,
                durationOfFeedback: 1000,
                numTrials: 20,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                probOfShift: 50,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        injection: "cached-string",
                        cacheKey: "task-switching-num-correct",
                        textContent: "You got ??? out of 20 trials correct"
                    }
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: true,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            skippable: true,
            skippableCacheKey: "task-switching-should-skip",
            content: {
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "We will repeat this round so you can get more practice"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" when you are ready for the next stage'
                    }
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            skippable: true,
            skippableCacheKey: "task-switching-should-skip",
            content: {
                title: "Practice round 2",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Remember, the number's color tells you what you must identify about the number"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>ORANGE NUMBER</b>"
                    },
                    {
                        sectionType: "text",
                        textContent: "Less than 5: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Greater than 5: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>BLUE NUMBER</b>"
                    },
                    {
                        sectionType: "text",
                        textContent: "Odd: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Even: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready for the practice round'
                    }
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.TASK_SWITCHING_COMPONENT,
            config: {
                isPractice: true,
                skippable: true,
                maxResponseTime: 4000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: true,
                durationFixationPresented: 500,
                durationOfFeedback: 1000,
                numTrials: 20,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                probOfShift: 50,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round 3",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Last practice"
                    },
                    {
                        sectionType: "text",
                        textContent: "This time we won't give you feedback after each answer"
                    },
                    {
                        sectionType: "text",
                        textContent: "Do your best!"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed'
                    }
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: true,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round 3",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Remember, the number's color tells you what you must identify about the number"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>ORANGE NUMBER</b>"
                    },
                    {
                        sectionType: "text",
                        textContent: "Less than 5: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Greater than 5: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>BLUE NUMBER</b>"
                    },
                    {
                        sectionType: "text",
                        textContent: "Odd: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Even: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready for the practice round'
                    }
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.TASK_SWITCHING_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 4000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: false,
                durationFixationPresented: 500,
                durationOfFeedback: 1000,
                numTrials: 10,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                probOfShift: 50,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Main round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Great! All practices are complete."
                    },
                    {
                        sectionType: "text",
                        textContent: "Now you will play the real game."
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed'
                    }
                ],
                buttons: {
                    isStart: false,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Recap instructions",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Remember, the number's color tells you what you must identify about the number"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>ORANGE NUMBER</b>"
                    },
                    {
                        sectionType: "text",
                        textContent: "Less than 5: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Greater than 5: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: "<b>BLUE NUMBER</b>"
                    },
                    {
                        sectionType: "text",
                        textContent: "Odd: Left arrow key ⬅️"
                    },
                    {
                        sectionType: "text",
                        textContent: "Even: Right arrow key ➡️"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "START" when you are ready for the practice round'
                    }
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            }
        },
        {
            component: ComponentName.TASK_SWITCHING_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 4000,
                interTrialDelay: 0,
                showFeedbackAfterEachTrial: false,
                durationFixationPresented: 500,
                durationOfFeedback: 1000,
                numTrials: 125,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                probOfShift: 50,
                stimuliConfig: {
                    type: "generated",
                    stimuli: null,
                },
            }
        },
    ],
};