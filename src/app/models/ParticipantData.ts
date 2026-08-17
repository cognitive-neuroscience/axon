import { UseHand } from '../pages/tasks/task-playables/finger-tapping/finger-tapping-task.component';
import { RatingTaskCounterBalance } from '../pages/tasks/task-playables/everyday-choice/rater/rater.component';
import { SmileyFaceTaskCounterbalance } from '../pages/tasks/task-playables/smiley-face/smiley-face.component';
import { Key, UserResponse } from './InternalDTOs';
import { ParticipantType } from './enums';
import {
    FaceNameAssociationTaskTrialtype,
    SARTStimuliSetType,
    SARTTrialType,
    SmileyFaceType,
} from '../services/data-generation/stimuli-models';

export enum TaskNames {
    ODDBALL = 'oddball',
    DIGITSPAN = 'digitspan',
    FINGERTAPPING = 'fingertapping',
    NBACK = 'nback',
    STROOP = 'stroop',
    TRAILMAKING = 'trailmaking',
    TASKSWITCHING = 'taskswitching',
    DEMANDSELECTION = 'demandselection',
    SMILEYFACE = 'smileyface',
    EVERYDAYCHOICE = 'everydaychoice',
}

export interface BaseParticipantData {
    trial: number;
    userID: string;
    submitted: string; // ISO date string
    isPractice: boolean;
    studyId: number;
}

export interface StroopTaskData extends BaseParticipantData {
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    isCongruent: boolean;
    responseTime: number;
    isCorrect: boolean;
    score: number;
}

export interface NBackTaskData extends BaseParticipantData {
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    responseTime: number;
    set: number;
    isCorrect: boolean;
    score: number;
    letterShown: string;
    nback: string;
}

export interface TaskSwitchingTaskData extends BaseParticipantData {
    color: string;
    digit: number;
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    responseTime: number;
    isCorrect: boolean;
    score: number;
}

export interface DemandSelectionTaskData extends BaseParticipantData {
    firstPatch: string;
    secondPatch: string;
    selectedPatch: string;
    harderPatch: string;
    selectPatchResponseTime: number;
    respondToNumberResponseTime: number;
    taskGoal: string; // which counter balance for blocks 5 and 6
    color: string;
    digit: number;
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    block: number;
    rotation: number;
    isCorrect: boolean;
    score: number;
}

export interface TrailMakingTaskData extends BaseParticipantData {
    trialType: string;
    actualAnswer: string;
    userAnswer: string;
    timeFromLastClick: number;
    isCorrect: boolean;
}

export interface FingerTappingTaskData extends BaseParticipantData {
    block: number;
    dominantHand: UseHand;
    handUsed: string;
    timeFromLastKeyPress: number;
    keyPressed: Key;
    isCorrect: boolean;
}

export interface DigitSpanTaskData extends BaseParticipantData {
    actualAnswer: string; // the actual sequence given
    userAnswer: string; // the sequence the user inputs
    responseTime: number; // time from when keypad entered screen to participant submitting their response
    numberOfDigits: number;
    isForwardMemoryMode: boolean;
    isCorrect: boolean;
    score: number;
}

export interface OddballTaskData extends BaseParticipantData {
    stimulus: string;
    targetResponse: Key;
    responseTime: number;
    actualAnswer: Key;
    userAnswer: string;
    target: string;
    block: number;
    isCorrect: boolean;
    score: number;
}

export interface SmileyFaceTaskData extends BaseParticipantData {
    actualAnswer: string;
    userAnswer: string;
    responseTime: number;
    block: number;
    stimulus: SmileyFaceType;
    keyPressed: string;
    rewarded: boolean;
    rewardedMore: SmileyFaceTaskCounterbalance;
    isCorrect: boolean;
    score: number;
    /**
     * a flag that marks this data as coming from the newer smiley face version with
     * corrected/fixed mouth lengths
     */
    isNewVersion: boolean;
}

export interface EverydayChoiceTaskData extends BaseParticipantData {
    taskName: string;
    counterbalance: RatingTaskCounterBalance;
    activity: string;
    question: string;
    userAnswer: string;
    activityType: 'DoNothing' | 'DoSomething' | '';
    responseTime: number;
    choiceTaskStimulusSet: 'first' | 'second' | '';
}

export interface SARTTaskData extends BaseParticipantData {
    setType: SARTStimuliSetType;
    blockNum: number;
    digit: number;
    fontSize: number;
    trialType: SARTTrialType;
    userAnswer: SARTTrialType;
    actualAnswer: SARTTrialType;
    responseTime: number;
    isCorrect: boolean;
}

export interface FaceNameAssociationTaskData extends BaseParticipantData {
    isPractice: boolean;
    phase: 'learning-phase' | 'test-phase';
    imagePresented: string;
    namePresented: string;
    actualName: string;
    stimulusSet: number;
    gender: 'M' | 'F';
    trialType: FaceNameAssociationTaskTrialtype;
    userAnswer: UserResponse;
    actualAnswer: UserResponse;
    isCorrect: boolean;
    responseTime: number;
    blockNum: number;
    attentionCheck: string;
}

export interface JudgementOfLineTaskData extends BaseParticipantData {
    isPractice: boolean;
    targetLinePresented: string;
    targetAnglePresented: string;
    isCorrect: boolean;
    responseTime: number;
    userAnswer: string;
}

export interface PLTTaskData extends BaseParticipantData {
    score: number;
    isPractice: boolean;
    phase: 'practice-phase' | 'training-phase' | 'test-phase';
    leftStimulusPresented: string;
    leftImageFileName: string;
    rightStimulusPresented: string;
    rightImageFileName: string;
    selectedStimulus: string;
    selectedStimulusImageFileName: string;
    selectedStimulusWasRewarded: boolean;
    expectedStimulus: string;
    expectedStimulusImageFileName: string;
    userAnswer: Key | UserResponse.NA;
    expectedAnswer: Key;
    userAnswerIsExpectedAnswer: boolean;
    responseTime: number;
}

export interface IowaGamblingTaskData extends BaseParticipantData {
    buttonChoice: number;
    selectButtonResponseTime: number;
    pressSpaceResponseTime: number;
    trialHasFee: boolean;
    moneyInBankBeforeButtonSelection: number;
    moneyInBankAfterButtonSelection: number;
    moneyWon: number;
    feePaid: number;
}

export interface InformationTaskData extends BaseParticipantData {
    roundNum: number;
    trialScore: number;
    cumulativeRoundScore: number;
    cumulativeRoundLength: number;
    trialResponseTime: number;
    exploited: boolean;
    expectedToExploit: boolean;
}

export interface SDMTData extends BaseParticipantData {
    blockNum: number;
    imageURL: string;
    isCorrect: boolean;
    actualAnswer: string;
    userAnswer: string;
    timeFromLastValidKeyPress: number;
}

export interface ParticipantData {
    userId: string;
    studyId: number;
    taskOrder: number;
    participantType: ParticipantType;
    submittedAt: string;
    metadata: { wasSkipped?: boolean };
    data: BaseParticipantData[] | { [key: string]: any }[];
}
