import { StimuliProvidedType } from "src/app/models/enums";
import { Color } from "src/app/models/InternalDTOs";
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
                            "Remember, the color of the number tells you what you must identify about that number",
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
        {
            component: ComponentName.DEMAND_SELECTION_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 5000,
                interTrialDelay: 0, 
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 1000,
                numTrials: 5,
                delayToShowHelpMessage: 4000,
                durationHelpMessageShown: 6000,
                probOfShiftFirstPatch: 10,
                probOfShiftSecondPatch: 90,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                counterbalanceMode: "none",
                stimuliConfig: {
                    type: StimuliProvidedType.HARDCODED,
                    stimuli: [
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.BLUE,
                            secondPatch: Color.ORANGE,
                            digit: 7,
                        },
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.BLUE,
                            secondPatch: Color.ORANGE,
                            digit: 2,
                        },
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.ORANGE,
                            secondPatch: Color.BLUE,
                            digit: 4,
                        },
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.ORANGE,
                            secondPatch: Color.BLUE,
                            digit: 8,
                        },
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.BLUE,
                            secondPatch: Color.ORANGE,
                            digit: 1,
                        },
                    ]
                }
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Practice round is now complete",
                sections: [
                    {
                        sectionType: "text",
                        injection: "cached-string",
                        cacheKey: "demandselection-num-correct",
                        textContent: "You got ??? out of 5 correct"
                    }
                ]
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Recap Instructions",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "Remember, the color of the number tells you what you must identify about that number",
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
                        textContent: 'Click "START" to launch the practice'
                    }
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: true,
                    nextDisabled: false,
                },
            },
        },
        {
            component: ComponentName.DEMAND_SELECTION_COMPONENT,
            config: {
                isPractice: true,
                maxResponseTime: 5000,
                interTrialDelay: 0, 
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 1000,
                numTrials: 5,
                delayToShowHelpMessage: 4000,
                probOfShiftFirstPatch: 10,
                probOfShiftSecondPatch: 90,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                counterbalanceMode: "none",
                stimuliConfig: {
                    type: StimuliProvidedType.HARDCODED,
                    stimuli: [
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 270,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.ORANGE,
                            secondPatch: Color.BLUE,
                            digit: 1,
                        },
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.BLUE,
                            secondPatch: Color.ORANGE,
                            digit: 1,
                        },
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.ORANGE,
                            secondPatch: Color.BLUE,
                            digit: 7,
                        },
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.ORANGE,
                            secondPatch: Color.BLUE,
                            digit: 9,
                        },
                        {
                            firstPatchImgName: "abstPa.png",
                            secondPatchImgName: "abstPb.png",
                            rotation: 105,
                            counterbalance: DemandSelectionCounterbalance.NONE,
                            firstPatch: Color.BLUE,
                            secondPatch: Color.ORANGE,
                            digit: 3,
                        },
                    ]
                }
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Main Round",
                sections: [
                    {
                        sectionType: "text",
                        textContent: "Good job! Now we will start the real game"
                    },
                    {
                        sectionType: "text",
                        textContent: "There are six short parts to the game, each lasting a few minutes. You can take short beraks in between each."
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
                title: "",
                sections: [
                    {
                        sectionType: "text",
                        injection: "cached-string",
                        cacheKey: "demandselection-block-num",
                        textContent: "This is part ??? of the game",
                    }
                ]
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Recap Instructions",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "Remember, first pick a patch then make a decision based on the color of the number, ORANGE or BLUE",
                    },
                    {
                        sectionType: "text",
                        textContent: "The patches are different:",
                    },
                    {
                        sectionType: "text",
                        textContent: "The numbers hiding behind each patch change color more or less often depending on the patch",
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
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Recap Instructions",
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
                        textContent: "Try to avoid choosing the patch solely based on how they look or on their location",
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
            },
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Recap Instructions",
                sections: [
                    {
                        sectionType: "text",
                        textContent:
                            "Remember, the color of the number tells you what you must identify about that number",
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
                        textContent: 'Click "START" when you are ready'
                    }
                ],
                buttons: {
                    isStart: true,
                    previousDisabled: false,
                    nextDisabled: false,
                },
            },
        },
        {
            component: ComponentName.DEMAND_SELECTION_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 5000,
                interTrialDelay: 0, 
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 1000,
                numTrials: 5,
                delayToShowHelpMessage: 4000,
                probOfShiftFirstPatch: 10,
                probOfShiftSecondPatch: 90,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                counterbalanceMode: "none",
                stimuliConfig: {
                    type: StimuliProvidedType.GENERATED,
                    stimuli: null
                }
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Congrats, you have finished this part",
                sections: []
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
                        cacheKey: "demandselection-block-num",
                        textContent: "This is part ??? of the game",
                    }
                ]
            }
        },
        {
            component: ComponentName.DEMAND_SELECTION_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 5000,
                interTrialDelay: 0, 
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 1000,
                numTrials: 5,
                delayToShowHelpMessage: 4000,
                probOfShiftFirstPatch: 10,
                probOfShiftSecondPatch: 90,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                counterbalanceMode: "none",
                stimuliConfig: {
                    type: StimuliProvidedType.GENERATED,
                    stimuli: null
                }
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Congrats, you have finished this part",
                sections: []
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
                        cacheKey: "demandselection-block-num",
                        textContent: "This is part ??? of the game",
                    }
                ]
            }
        },
        {
            component: ComponentName.DEMAND_SELECTION_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 5000,
                interTrialDelay: 0, 
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 1000,
                numTrials: 5,
                delayToShowHelpMessage: 4000,
                probOfShiftFirstPatch: 10,
                probOfShiftSecondPatch: 90,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                counterbalanceMode: "none",
                stimuliConfig: {
                    type: StimuliProvidedType.GENERATED,
                    stimuli: null
                }
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Congrats, you have finished this part",
                sections: []
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
                        cacheKey: "demandselection-block-num",
                        textContent: "This is part ??? of the game",
                    }
                ]
            }
        },
        {
            component: ComponentName.DEMAND_SELECTION_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 5000,
                interTrialDelay: 0, 
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 1000,
                numTrials: 5,
                delayToShowHelpMessage: 4000,
                probOfShiftFirstPatch: 10,
                probOfShiftSecondPatch: 90,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                counterbalanceMode: "none",
                stimuliConfig: {
                    type: StimuliProvidedType.GENERATED,
                    stimuli: null
                }
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Congrats, you have finished this part",
                sections: []
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
                        cacheKey: "demandselection-block-num",
                        textContent: "This is part ??? of the game.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Read these instructions."
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Find the <b>???</b> and pick that one on each trial"
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance",
                        textContent: "Remember, once you have found and selected the <b>???</b>, your goal is still to make a decision about the number that appears based on its color: ORANGE or BLUE"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed'
                    }
                ]
            }
        },
        {
            component: ComponentName.DEMAND_SELECTION_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 5000,
                interTrialDelay: 0, 
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 1000,
                numTrials: 3,
                delayToShowHelpMessage: 4000,
                probOfShiftFirstPatch: 10,
                probOfShiftSecondPatch: 90,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                counterbalanceMode: "counterbalance-alternative",
                stimuliConfig: {
                    type: StimuliProvidedType.GENERATED,
                    stimuli: null
                }
            }
        },
        {
            component: ComponentName.DISPLAY_COMPONENT,
            content: {
                title: "Congrats, you have finished this part",
                sections: []
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
                        cacheKey: "demandselection-block-num",
                        textContent: "This is part ??? of the game.",
                    },
                    {
                        sectionType: "text",
                        textContent: "Read these instructions."
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Find the <b>???</b> and pick that one on each trial"
                    },
                    {
                        sectionType: "text",
                        injection: "counterbalance-alternative",
                        textContent: "Remember, once you have found and selected the <b>???</b>, your goal is still to make a decision about the number that appears based on its color: ORANGE or BLUE"
                    },
                    {
                        sectionType: "text",
                        textContent: 'Click "NEXT" to proceed'
                    }
                ]
            }
        },
        {
            component: ComponentName.DEMAND_SELECTION_COMPONENT,
            config: {
                isPractice: false,
                maxResponseTime: 5000,
                interTrialDelay: 0, 
                showFeedbackAfterEachTrial: true,
                durationOfFeedback: 1000,
                numTrials: 3,
                delayToShowHelpMessage: 4000,
                probOfShiftFirstPatch: 10,
                probOfShiftSecondPatch: 90,
                oddEvenColor: Color.BLUE,
                ltGtColor: Color.ORANGE,
                counterbalanceMode: "counterbalance",
                stimuliConfig: {
                    type: StimuliProvidedType.GENERATED,
                    stimuli: null
                }
            }
        },
    ],
};
