import { EQuestionType, IBaseQuestion, QuestionnaireMetadata, TConditional } from './models';

export function keysExistAndAreUniqueHelper(metadata: QuestionnaireMetadata): boolean {
    const keysMap: { [key: string]: boolean } = {};

    metadata.componentConfig.questions.forEach((question) => {
        // ignore the purely decorative components that do not need keys
        if (question.questionType !== EQuestionType.displayText && question.questionType !== EQuestionType.divider) {
            const typedQuestion = question as IBaseQuestion;
            if (typedQuestion.key === '' || typedQuestion.key === undefined) return false;

            if (keysMap[typedQuestion.key]) {
                return false;
            } else {
                keysMap[typedQuestion.key] = true; // can assign any value here, all that matters is the key in the keysMap exists
            }
        }
    });
    return true;
}

export function getConditionalMappingHelper(metadata: QuestionnaireMetadata): {
    [key: string]: (Pick<TConditional, 'doAction'> & { controlAffectedKey: string })[];
} {
    const conditionalMapping: {
        [key: string]: (Pick<TConditional, 'doAction'> & { controlAffectedKey: string })[];
    } = {};
    metadata.componentConfig.questions.forEach((question) => {
        if (question.condition) {
            if (conditionalMapping[question.condition.dependsOnKey]) {
                conditionalMapping[question.condition.dependsOnKey].push({
                    doAction: question.condition.doAction,
                    controlAffectedKey: (question as IBaseQuestion).key,
                });
            } else {
                conditionalMapping[question.condition.dependsOnKey] = [
                    {
                        doAction: question.condition.doAction,
                        controlAffectedKey: (question as IBaseQuestion).key,
                    },
                ];
            }
        }
    });
    return conditionalMapping;
}

export function someElementInFirstListExistsInSecondList(arr1: any[], arr2: any[]): boolean {
    const someValInArr1ExistsInArr2 = arr1.some((arr1Element) => {
        return arr2.some((arr2Element) => arr2Element === arr1Element);
    });
    return someValInArr1ExistsInArr2;
}

export function valIsEmpty(val: any): boolean {
    if (Array.isArray(val)) return val.length === 0;

    return val === null || val === undefined || val === '';
}
